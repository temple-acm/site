/*
 * This is for ADMIN RELATED STUFF HOORAY WOOO YEAH GO TEAM FUCK YEAH MURICA
 */

var passport = require('passport'),
    logger = require('../util/log'),
    acl = require('acl'),
    ObjectId = require('mongodb').ObjectID;

acl = new acl(new acl.memoryBackend()); // TODO: This needs to be changed to mongo backend in prod

exports.route = function(app) {
    /*
     * This endpoint fetches a single slide's data from the database.
     *
     *  Input:
     *      order: the ordering number of the slide to be fetched.
     *  Output:
     *      Success:
     *          status: 200
     *          data: JSON document representing the slide
     *      Failure:
     *          Slide num not present for call:
     *              status: 200
     *              data: { '500' : 'Unspecified error' }
     *          DB error:
     *              status: 200
     *              data: { '500' : 'Unspecified error' }
     *          Unauthorized access:
     *              status: 403
     */
    app.get('/admin/getSlide', acl.middleware(1), function(err, req, res, next) {
        if (err) {
            console.log('error', 'Unauthorized access to endpoint /admin/getSlide');
            res.status(401).send({
                '401' : 'Unauthorized'
            });
        } else if (req.body.slideOrderNum) {
            req.db.collection('slides').findOne({
                order: req.body.slideOrderNum
            }, {
                limit: 1
            }, function(err, slideDoc) {
                if (err) {
                    logger.log('error', 'DB query gone wrong in getSlide', err);
                    res.status(200).send({
                        '500' : 'Unspecified Error'
                    });
                } else {
                    res.status(200).json(slideDoc);
                }
            });
        } else {
            //how do you mess this up it's literally one number
            logger.log('error', 'Slide number missing in call to getSlide', err);
            res.status(200).send({
                '500' : 'Unspecified error'
            });
        }
    });

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
    });

    /*
     * This endpoint adds a banner slide to the database. Be sure to properly
     * pass in all three required parts.
     *
     *  Input:
     *      slideHTML: The HTML to go along with the slide. Optional.
     *      slideLink: The link to the banner image (because screw self-hosting amirite)
     *      slideTitle: The title of the slide
     *      slideSubtitle: The subtitle of the slide
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
    });

    /*
     * This endpoint removes a banner slide from the database.
     * It takes as its single argument an ObjectID corresponding to the slide
     * entry that is to be deleted. It then removes that slide from the collection
     * and decrements the order field of every slide afterwards, to ensure consistent
     * ordering.
     *
     *  Output:
     *      slideObjectID: The ObjectID of the slide to be deleted.
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
    });

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
                        res.status(200).send({
                            '200': 'OK'
                        });
                    }
                });
            } else {
                req.db.collection('users').update({
                    _id : accountObjectId
                }, {
                    $set: {
                        title: title,
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
                        acl.addUserRoles(req.body._id, 'admin', function(err) {
                            if (err) {
                                logger.log('error', 'could not change acl for account ' + req.body.accountName, err);
                                res.status(200).send({
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
            logger.error('Invalid information sent.');
            res.status(200).send({
                '500' : 'Unspecified error'
            });
        }
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
        req.db.collection('users').find({}, {
            firstName: 1,
            lastName: 1,
            bio: 1,
            email: 1,
            officer: 1
        }).toArray(function(err, members) {
            if (err) {
                logger.log('error', 'Error retrieving db data for getMembers(): ' + err);
                res.status(200).send({'500': 'Unspecified Error'});
            } else {
                res.status(200).send({'200' : members });
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
