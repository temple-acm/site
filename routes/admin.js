/*
 * This is for ADMIN RELATED STUFF HOORAY WOOO YEAH GO TEAM FUCK YEAH MURICA
 */

var passport = require('passport'),
    logger = require('../util/log');

exports.route = function(app) {

    /*
     * This endpoint removes the officer status of the account specified.
     *
     * TODO: access control beyond basic officer checking
     *
     *  Input:
     *      accountName: the username of the account to demote
     *  Output:
     *      Success:
     *          status: 200
     *          data: {'200' : 'OK' }
     *      Failure:
     *          DB error demoting account:
     *              status: 200
     *              data: {'500' : 'Unspecified error' }
     *          Unauthorized access:
     *              status: 403
     *          Invalid account name:
     *              status: 200
     *              data: {'500' : 'Unspecified error' }
     */
    app.post('/admin/removeOfficer', function(req, res) {
        if (req.user && req.user[0].officer) {
            if (req.body.accountName) {
                req.db.collection('users').update({
                    userName: accountName
                }, {
                    $unset: {
                        officer: ""
                    }
                }, {
                    multi: false
                }, function(err) {
                    if (err) {
                        logger.log('error', 'could not demote account ' + accountName, err);
                        res.status(200).send({
                            '500' : 'Unspecified error'
                        });
                    } else {
                        res.status(200).send({
                            '200' : 'OK'
                        });
                    }
                });
            } else {
                logger.log('error', 'Invalid account name ' + accountName + 'in /admin/removeOfficer');
                res.status(200).send({
                    '500' : 'Unspecified error'
                });
            }
        } else {
            // they're not an officer how dare they
            logger.log('warning', 'Unauthorized endpoint access at /admin/removeOfficer');
            res.status(403).send();
        }
    });

    /*
     * This endpoint updates an account's status to "officer" in the backend db,
     * given the relevant officer-only information.
     *
     * TODO: Access control?
     *
     *  Input:
     *      accountName: the username of the account to elevate
     *      title: their title
     *      bio: an updated bio. Optional.
     *  Output:
     *      Success:
     *          status: 200
     *          data: { "200" : "OK" }
     *      Failure:
     *          Error changing/elevating account:
     *              status: 200
     *              data: { "500" : "Unspecified error" }
     *          Unauthorized user:
     *              status: 403
     *          Invalid information:
     *              status: 200
     *              data: { "500" : "Invalid information" }
     */
    app.post('/admin/addOfficer', function(req, res) {
        if (req.user && req.user[0].officer) {
            if (req.body.accountName && req.body.accountTitle) {
                if (req.body.accountBio) {
                    req.db.collection('users').update({
                        userName: accountName
                    }, {
                        $set: {
                            title: accountTitle,
                            officer: true,
                            bio: accountBio
                        }
                    }, {
                        multi: false,
                        upsert: true
                    }, function(err) {
                        if (err) {
                            logger.log('error', 'could not mark user ' + accountName + ' as officer', err);
                            res.status(200).send({
                                '500': 'Unspecified error'
                            });
                        } else {
                            res.status(200).send({
                                '200': 'OK'
                            });
                        }
                    });
                } else {
                    req.db.collection('users').update({
                        userName: accountName
                    }, {
                        $set: {
                            title: accountTitle,
                            officer: true
                        }
                    }, {
                        multi: false
                    }, function(err) {
                        if (err) {
                            logger.log('error', 'could not mark user ' + accountName + ' as officer', err);
                            res.status(200).send({
                                '500': 'Unspecified error'
                            });
                        } else {
                            res.status(200).send({
                                '200' : 'OK'
                            });
                        }
                    });
                }
            } else {
                logger.log('error', 'Invalid information sent.');
                res.status(200).send({
                    '500' : 'Invalid information'
                });
            }
        } else {
            // they're not an officer what a bunch of posers
            logger.log('warning', "Attempt to access admin endpoint without permission");
            res.status(403).send();
        }
    });
};
