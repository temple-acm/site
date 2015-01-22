/*
 * This is for ADMIN RELATED STUFF HOORAY WOOO YEAH GO TEAM FUCK YEAH MURICA
 */

var passport = require('passport'),
    logger = require('../util/log'),
    node_acl = require('acl'),
    ObjectId = require('mongodb').ObjectID,
    MongoClient = require('mongodb').MongoClient,
    acl;

var url = process.env.TUACM_MONGO_URL;

logger.log('info', 'Connecting to acl backend...');
MongoClient.connect(url, function(err, db) {
    var aclBackend = new node_acl.mongodbBackend(db);
    acl = new node_acl(aclBackend);
    logger.log('info', 'ACL backend initialized for admin.');
});

exports.route = function(app) {

    /*
     * This endpoint simply gives you all the slides present in the backend
     * database.
     *
     * Output:
     *  Success:
     *      status: 200
     *      data: JSON describing all the slides in the backend
     *  Failure:
     *      status: 200
     *      daat: { '500' : 'Unspecified error' }
     *  Unauthorized access:
     *      status: 403
     */
    app.get('/admin/allSlides', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to endpoint /admin/allSlides blocked');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                req.db.collection('slides').find({}, {
                    'sort': [[ 'order', 'asc' ]]
                }).toArray(function(err, data) {
                    if (err) {
                        console.log('error', 'Error retrieving slides from database: ' + err);
                        res.status(200).send({
                            '500': 'Unspecified error'
                        });
                    } else {
                        res.status(200).send(data);
                    }
                });
            }
        });
    });

    /*
     * This endpoint adds a banner slide to the database. Be sure to properly
     * pass in the two required parts.
     *
     *  Input:
     *      html: The HTML to go along with the slide.
     *      image: The link to the banner image (because screw self-hosting amirite)
     *  Output:
     *      Success:
     *          status: 200
     *          data: { '200' : 'OK' }
     *      Failure:
     *          Unauthorized access:
     *              status: 401
     *          DB error:
     *              status: 200
     *              data: { '500' : 'Unspecified error' }
     *          Invalid input:
     *              status: 200
     *              data: { '500' : 'Unspecified error' }
     */
    app.post('/admin/addSlide', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to /admin/addSlide blocked');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                if (req.body.image && req.body.html) {
                    //Increment the order of all pre-existing slides in the DB
                    req.db.collection('slides').update({}, {
                        $inc: {
                            order: 1
                        }
                    }, {
                        multi: true
                    }, function(err, updatedData) {
                        if (err) {
                            logger.log('error', 'DB increment operation went wrong in /admin/addSlide');
                            res.status(200).send({
                                '500' : 'Unspecified error'
                            });
                        }
                    });
                    // Now save the new slide with order 1, so it appears first
                    req.db.collection('slides').save({
                        image: req.body.image,
                        order: 1,
                        html: req.body.html
                    }, {}, function(err, createdSlide) {
                        if (err) {
                            logger.log('error', 'DB save operation went wrong in /admin/addSlide');
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
                    // wow these muppets forgot an element. what a bunch of noobcakes
                    // TODO: maybe we say exactly which element is missing, that'd probably help debugging
                    logger.log('error', 'Required slide element missing in /admin/addSlide');
                    res.status(200).send({
                        '500' : 'Unspecified error'
                    });
                }
            }
        });
    });

    /*
     * This endpoint updates a specific slide, referenced by ObjectID. It will
     * overwrite the database values for order, image, and html with the values
     * passed in, whatever they might be.
     *
     * Output:
     *  Success:
     *      status: 200
     *      data: { '200' : 'OK' }
     *  Failure:
     *      Unauthorized access:
     *          status: 403
     *      DB Error:
     *          status: 200
     *          data: { '500' : 'Unspecified error' }
     */
    app.post('/admin/updateSlide', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized acess to /admin/updateSlide blocked.');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                if (req.body.image && req.body.html && req.body.order && req.body._id) {
                    slideObjectId = new ObjectId(req.body._id);
                    req.db.collection('slides').update({
                        _id: slideObjectId
                    },
                    { $set:
                        {
                            image: req.body.image,
                            html: req.body.html,
                            order: req.body.order
                        }
                    }, function(err, updatedSlide) {
                        if (err) {
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
                    res.status(500).send({
                        '500' : 'Unspecified error'
                    });
                }
            }
        });
    });

    /*
     * This endpoint removes a banner slide from the database.
     * It takes as its single argument an ObjectID corresponding to the slide
     * entry that is to be deleted. It then removes that slide from the collection
     * and decrements the order field of every slide afterwards, to ensure consistent
     * ordering.
     *
     *  Input:
     *      id: The ObjectID of the slide to be deleted.
     *  Output:
     *      Success:
     *          status: 200
     *          data: { '200' : 'OK' }
     *      Failure:
     *          ObjectID not present:
     *              status: 200
     *              data: {'500' : 'Unspecified error' }
     *          DB error:
     *              status: 200
     *              data: { '500' : 'Unspecified error' }
     *      Unauthorized access:
     *          status: 403
     */
    app.post('/admin/removeSlide', function(req, res) {
        if (req.session.passport) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to /admin/removeSlide blocked.');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                if (req.body.id) {
                    removeObjectId = new ObjectId(req.body.id);
                    req.db.collection('slides').find({
                        _id: removeObjectId
                    }, {
                        order: 1
                    }, function(err, removedIndex) {
                        if (err) {
                            logger.log('error', 'Cannot find slide with specified ID in /admin/removeSlide', err);
                            res.status(200).send({
                                '500' : 'Unspecified error'
                            });
                        } else {
                            req.db.collection('slides').remove({
                                _id: removeObjectId
                            }, {
                                w: 1,
                            }, function(err, numRemovedDocs) {
                                if (err || numRemovedDocs != 1) {
                                    logger.log('error', 'Something went wrong with the remove operation in /admin/removeSlide', err);
                                    res.status(200).send({
                                        '500' : 'Unspecified error'
                                    });
                                } else {
                                    req.db.collection('slides').update({
                                        order: {
                                            $gte: removedIndex.fields.order
                                        }
                                    }, {
                                        $inc: {
                                            order: -1
                                        }
                                    }, {
                                        multi: true
                                    }, function(err, numUpdatedDocs) {
                                        if (err) {
                                            logger.log('error', 'Something wrong with the decrement operation in /admin/removeSlide', err);
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
                            });
                        }
                    });
                } else {
                    // wow how do you mess this up
                    logger.log('error', 'slide ObjectID not present', err);
                    res.status(200).send({
                        '500' : 'Unspecified error'
                    });
                }
            }
        });
    });

    /*
     * This endpoint removes the officer status of the account specified.
     *
     * TODO: access control beyond basic officer checking
     *
     *  Input:
     *      id: the ObjectID of the account to demote
     *  Output:
     *      Success:
     *          status: 200
     *          data: {'200' : 'OK' }
     *      Failure:
     *          DB error demoting account:
     *              status: 200
     *              data: {'500' : 'Unspecified error' }
     *          Unauthorized access:
     *              status: 401
     *              data: {'401' : 'Unauthorized'}
     *          Invalid account name:
     *              status: 200
     *              data: {'500' : 'Unspecified error' }
     */
    app.post('/admin/removeOfficer', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to /admin/removeOfficer blocked');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                if (req.body.id) {
                    var removeObjectId = new ObjectId(req.body.id);
                    req.db.collection('users').update({
                        _id: removeObjectId
                    }, {
                        $unset: {
                            officer: ""
                        }
                    }, {
                        multi: false
                    }, function(err) {
                        if (err) {
                            logger.log('error', 'could not demote account with ID ' + req.body.id, err);
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
                    logger.log('error', 'Invalid ObjectID in /admin/removeOfficer');
                    res.status(200).send({
                        '500' : 'Unspecified error'
                    });
                }
            }
        });
    });

    /*
     * This endpoint updates an account's status to "officer" in the backend db,
     * given the relevant officer-only information.
     *
     * TODO: Access control? First pass at implementation using acl module
     *
     *  Input:
     *      The object representation of the member to be promoted.
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
     *              data: { "500" : "Unspecified error" }
     */
    app.post('/admin/addOfficer', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
        if (err || isAllowed === false) {
            logger.log('error', 'Unauthorized access to /admin/addOfficer blocked.');
            res.status(401).send({
                '401' : 'Unauthorized'
            });
        } else {
            if (req.body._id && req.body.title) {
                var accountObjectId = new ObjectId(req.body._id);
                if (req.body.bio) {
                    req.db.collection('users').update({
                        _id : accountObjectId
                    }, {
                        $set: {
                            title: req.body.title,
                            officer: true,
                            bio: req.body.bio
                        }
                    }, {
                        multi: false,
                        upsert: true
                    }, function(err) {
                        if (err) {
                            logger.log('error', 'could not mark user with id ' + req.body._id + ' as officer', err);
                            res.status(200).send({
                                '500': 'Unspecified error'
                            });
                        } else {
                            console.log("Now adding to acl admin role");
                            acl.allow('admin', 'admin', '*');
                            acl.addUserRoles(req.body._id, 'admin', function(err) {
                                if (err) {
                                    logger.log('error', 'Could not change ACL for account with id ' + req.body._id, err);
                                    res.status(200).send({
                                        '500' : 'Unspecified error'
                                    });
                                } else {
                                    res.status(200).send({
                                        '200' : 'OK'
                                    });
                                }
                            });
                        }
                    });
                } else {
                    req.db.collection('users').update({
                        _id : accountObjectId
                    }, {
                        $set: {
                            title: req.body.title,
                            officer: true
                        }
                    }, {
                        multi: false,
                        upsert: true // TODO: Check if this is necessary
                    }, function(err) {
                        if (err) {
                            logger.log('error', 'could not mark user with ID ' + req.body._id + ' as officer', err);
                            res.status(200).send({
                                '500': 'Unspecified error'
                            });
                        } else {
                            console.log("Now doing my acl addUserRoles thing");
                            acl.allow('admin', 'admin', '*');
                            acl.addUserRoles(req.body._id, 'admin', function(err) {
                                if (err) {
                                    logger.log('error', 'could not change acl for account ' + req.body.accountName, err);
                                    res.status(200).send({
                                        '500' : 'Unspecified error'
                                    });
                                } else {
                                    res.status(200).send({
                                        '200' : 'OK'
                                    });
                                }
                            });
                        }
                    });
                }
            } else {
                logger.error('Invalid information sent.');
                res.status(200).send({
                    '500' : 'Unspecified error'
                });
            }
        }
        });
    });

    /*
     * This endpoint sends back all the fields for a particular member, accessed by
     * ObjectID.
     * Output:
     *  Success:
     *      status: 200
     *      data: { '200' : member data object }
     *  Error:
     *      Database error:
     *          status: 200
     *          data: {'500' : 'Unspecified error' }
     *      Access forbidden:
     *          status: 401
     */
    app.post('/admin/getMember', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to /admin/getMember blocked.');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                try {
                    var accountObjectId = new ObjectId(req.body._id);
                } catch(err) {
                    logger.log("error", 'Invalid ObjectID in /admin/getMember');
                    res.status(200).send({'500' : 'Unspecified error'});
                    return;
                }
                req.db.collection('users').find({
                    _id: accountObjectId
                }, {
                    userName: 1,
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    paid: 1,
                    picture: 1,
                    bio: 1,
                    github: 1,
                    twitter: 1,
                    officer: 1,
                    title: 1,
                    dateLastPaid: 1,
                    dateRegistered: 1,
                    facebook: 1,
                    email: 1,
                    major: 1,
                    studentLevel: 1,
                    membership: 1
                }).toArray(function(err, member) {
                    if (err) {
                        logger.log('error', 'Error retrieving member object in getMember(): ' + err);
                        res.status(200).send({'500' : 'Unspecified error'});
                    } else {
                        if (member.length > 0) {
                            res.status(200).send({'200' : member});
                        } else {
                            res.status(200).send({'500' : 'Unspecified error'});
                        }
                    }
                });
            }
        });
    });

    /*
     * This endpoint sends back an object containing basic information about all
     * members. Specifically, it returns the firstName, lastName, email, and officer fields
     * of every user.
     *
     * Output:
     *  Success:
     *      status: 200
     *      data: an object containing the fields above for each officer
     *  Error:
     *      Database error:
     *          status: 200
     *          data: { "500" : "Unspecified error" }
     *      Access forbidden:
     *          status: 402
     */
    app.get('/admin/getMembers', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to /admin/getMembers blocked.');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                req.db.collection('users').find({}, {
                    firstName: 1,
                    lastName: 1,
                    bio: 1,
                    email: 1,
                    officer: 1,
                    studentLevel: 1
                }).toArray(function(err, members) {
                    if (err) {
                        logger.log('error', 'Error retrieving db data for getMembers(): ' + err);
                        res.status(200).send({'500': 'Unspecified Error'});
                    } else {
                        res.status(200).send({'200' : members });
                    }
                });
            }
        });
    });

    /*
     * This endpoint takes in an object corresponding to a member's information and updates their
     * corresponding object in the backend database. It is absolutely naive; all
     * verification that data is correct should be done on the client-side.
     *
     * Output:
     *  Success:
     *      status: 200
     *      data: { '200' : 'OK' }
     *  Error:
     *      Database error:
     *          status: 200
     *          data: { '500' : 'Unspecified error' }
     *      Access forbidden:
     *          status: 401
     *          data: { '401' : 'Unauthorized' }
     */
    app.post('/admin/updateMember', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to /admin/updateMember blocked.');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
                var memberObjectId = new ObjectId(req.body._id);
                req.db.collection('users').update({
                    _id: memberObjectId
                },
                { $set:
                    { // there must be a better way
                        userName: req.body.userName,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        paid: req.body.paid,
                        picture: req.body.picture,
                        bio: req.body.bio,
                        github: req.body.github,
                        twitter: req.body.twitter,
                        facebook: req.body.facebook,
                        email: req.body.email,
                        major: req.body.major,
                        studentLevel: req.body.studentLevel,
                        membership: req.body.membership
                    }
                }, {}, function(err, updatedMember) {
                    if (err) {
                        logger.log('Error updating member information in /admin/updateMember', err);
                        res.status(200).send({
                            '500' : 'Unspecified error'
                        });
                    } else {
                        res.status(200).send({'200' : 'OK' });
                    }
                });
            }
        });
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
    app.get('/admin/export/csv', function(req, res) {
        if (req.session.passport !== undefined) {
            var hexId = new ObjectId(req.session.passport.user).toHexString();
        } else {
            res.status(401).send({'401' : 'Unauthorized'});
            return;
        }
        acl.isAllowed(hexId, 'admin', '*', function(err, isAllowed) {
            if (err || isAllowed === false) {
                logger.log('error', 'Unauthorized access to /admin/export/csv blocked.');
                res.status(401).send({
                    '401' : 'Unauthorized'
                });
            } else {
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
            }
        });
    });
};
