/************************************** EXTERNAL IMPORTS ******************************************/

var nodemailer = require('nodemailer');

/************************************** INTERNAL IMPORTS ******************************************/

var logger = require('./log');

/******************************************* MODULE ***********************************************/

// TODO make this HTTPS friendly
var FORGOT_PASSWORD_EMAIL_TEMPLATE = 'Hello {{name}},\n\nAs per your request, here is a link you can use to reset your password:\n\nhttp://acm.temple.edu/settings/password/reset/{{token}}\n\nFor your protection, this link is only good for an hour after this email was sent. If you have any questions or did not request a password reset, pease contact us anytime at tuacm.temple.edu.\n\nBest regards, Temple ACM\n\nhttp://acm.temple.edu';
var PASSWORD_RESET_SUCCESS_EMAIL_TEMPLATE = 'Hello {{name}},\n\nYour Temple ACM account password was recently reset. If you have any questions or did not request a password reset, pease contact us anytime at tuacm.temple.edu.\n\nBest regards, Temple ACM\n\nhttp://acm.temple.edu';

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.TUACM_GMAIL_EMAIL,
        pass: process.env.TUACM_GMAIL_PASSWORD
    }
});

var sendForgotPassword = function(to, name, token) {
    // setup e-mail data with unicode symbols
    var forgotPasswordMailOptions = {
        from: 'Temple ACM <tuacm@temple.edu>', // sender address
        to: to,
        subject: 'Temple ACM Forgotten Password', // Subject line
        text: FORGOT_PASSWORD_EMAIL_TEMPLATE.replace('{{name}}', name).replace('{{token}}', token) // plaintext body
    };

    transporter.sendMail(forgotPasswordMailOptions, function(error, info) {
        if (error) {
            logger.error('Could not send email', error);
        } else {
            logger.info('Message sent: ' + info.response);
        }
    });
};

var sendPasswordResetSuccess = function(to, name) {
    // setup e-mail data with unicode symbols
    var forgotPasswordMailOptions = {
        from: 'Temple ACM <tuacm@temple.edu>', // sender address
        to: to,
        subject: 'Temple ACM Forgotten Password', // Subject line
        text: PASSWORD_RESET_SUCCESS_EMAIL_TEMPLATE.replace('{{name}}', name) // plaintext body
    };

    transporter.sendMail(forgotPasswordMailOptions, function(err, info) {
        if (err) logger.error('Could not send email', err);
    });
};

/******************************************* EXPORTS **********************************************/

exports.sendForgotPassword = sendForgotPassword;
exports.sendPasswordResetSuccess = sendPasswordResetSuccess;