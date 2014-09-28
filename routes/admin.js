/*
 * This is for ADMIN RELATED STUFF HOORAY WOOO YEAH GO TEAM FUCK YEAH MURICA
 */

var passport = require('passport'),
    logger = require('../util/log'),
    acl = require('acl');

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
    app.post('/admin/removeOfficer', acl.middleware(1), function(req, res) {
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
                    logger.log('error', 'could not demote account ' + req.body.accountName, err);
                    res.status(200).send({
                        '500' : 'Unspecified error'
                    });
                } else {
                    acl.removeUserRoles(req.body.accountName, 'admin', function(err) {
                        if (err) {
                            res.status(200).send({
                                logger.log('error', 'could not change acl for account ' + req.body.accountName, err);
                                '500' 'Unspecified error'
                            });
                        }
                    });
                    res.status(200).send({
                        '200' : 'OK'
                    });
                }
            });
        } else {
            logger.log('error', 'Invalid account name ' + req.body.accountName + 'in /admin/removeOfficer');
            res.status(200).send({
                '500' : 'Unspecified error'
            });
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
    app.post('/admin/addOfficer', acl.middleware(1), function(req, res) {
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
                        logger.log('error', 'could not mark user ' + req.body.accountName + ' as officer', err);
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
                        logger.log('error', 'could not mark user ' + req.body.accountName + ' as officer', err);
                        res.status(200).send({
                            '500': 'Unspecified error'
                        });
                    } else {
                        acl.addUserRoles(req.body.accountName, 'admin', function(err) {
                            if (err) {
                                res.status(200).send({
                                    logger.log('error', 'could not change acl for account ' + req.body.accountName, err);
                                    '500' : 'Unspecified error'
                                });
                            }
                        });
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
    });
    /*
     * This endpoint exports our members list to CSV. You must be logged in to do this.
     * The CSV is organized such that the columns of the document are denoted First Name,
     * Last Name, Email, Member Number.
     *
     * Output:
     *  Success:
     *      status: 200
     *      data: the CSV of members
     *      user objects.
     *  Error:
     *      status: 200
     *      data: { "500": err } where "err" is the error message.
     */
    app.get('/admin/export/csv', acl.middleware(1), function(req, res) {
        req.db.collection('users').find({}, {
            firstName: 1,
            lastName: 1,
            email: 1,
            membership: 1
        }).toArray(function(err, members) {
            if (err) {
                logger.log('error', err);
                res.status(500).send('Error retrieving members for CSV');
            } else {
                // Build the CSV
                var csv = 'First Name,Last Name,Email,Member Number\n';
                members.forEach(function(member, i) {
                    csv += member.firstName + ',' + member.lastName + ',' + member.email + ',' + member.membership + '\n';
                    if (i === members.length - 1) {
                        // We're done
                        res.status(200).type('text/csv').set({
                            'Content-Disposition': 'attachment; filename="members.csv"',
                        }).send(csv);
                    }
                });
            }
        });
    });
};
