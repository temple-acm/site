var assert = require('assert');
var requests = require('request');
var expect = require('chai').expect;

//describe('Array', function(){
//  describe('#indexOf()', function(){
//      it('should return -1 when the value is not present', function(){
//            assert.equal(-1, [1,2,3].indexOf(5));
//            assert.equal(-1, [1,2,3].indexOf(0));
//          })
//    })
//})
//

describe('Admin Sanity Checks', function() {
    describe('Slides Admin', function() {
        describe('/admin/allSlides', function() {
            it('should return 401 when not logged in', function(done) {
                requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.post('http://localhost:3000/admin/allSlides', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
        describe('/admin/addSlide', function() {
            it('should return 401 when not logged in', function(done) {
                requests.post('http://localhost:3000/admin/addSlide', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.get('http://localhost:3000/admin/addSlide', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
        describe('/admin/removeSlide', function() {
            it('should return 401 when not logged in', function(done) {
                requests.post('http://localhost:3000/admin/removeSlide', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.get('http://localhost:3000/admin/removeSlide', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
        describe('/admin/updateSlide', function() {
            it('should return 401 when not logged in', function(done) {
                requests.post('http://localhost:3000/admin/updateSlide', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.get('http://localhost:3000/admin/updateSlide', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
    });
    describe('Officer Admin', function() {
        describe('/admin/addOfficer', function() {
            it('should return 401 when not logged in', function(done) {
                requests.post('http://localhost:3000/admin/addOfficer', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.get('http://localhost:3000/admin/addOfficer', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
        describe('/admin/removeOfficer', function() {
            it('should return 401 when not logged in', function(done) {
                requests.post('http://localhost:3000/admin/removeOfficer', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.get('http://localhost:3000/admin/removeOfficer', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
    });
    describe('Members Admin', function() {
        describe('/admin/getMember', function() {
            it('should return 401 when not logged in', function(done) {
                requests.post('http://localhost:3000/admin/getMember', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.get('http://localhost:3000/admin/getMember', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
        describe('/admin/getMembers', function() {
            it('should return 401 when not logged in', function(done) {
                requests.get('http://localhost:3000/admin/getMembers', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.post('http://localhost:3000/admin/getMembers', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
        describe('/admin/updateMember', function() {
            it('should return 401 when not logged in', function(done) {
                requests.post('http://localhost:3000/admin/updateMember', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.get('http://localhost:3000/admin/updateMember', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
    });
    describe('Exports Admin', function() {
        describe('/admin/export/csv', function() {
            it('should return 401 when not logged in', function(done) {
                requests.get('http://localhost:3000/admin/export/csv', function(err, res, body) {
                    expect(res.statusCode).to.equal(401);
                    expect(JSON.parse(body)).to.deep.equal({'401' : 'Unauthorized'});
                    done();
                });
            });
            it('should return 404 when the request type is wrong', function(done) {
                requests.post('http://localhost:3000/admin/export/csv', function(err, res, body) {
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });
    });
});

describe('Admin Functionality', function() {
    /*
     * global state setup, primarily enabling cookies in requests and setting
     * up the database connection.
     */
    // cookies
    var j = requests.jar();
    requests = requests.defaults({jar: j});

    before(function(done) {
        // Log in as an officer so we can it things
        requests.post('http://localhost:3000/members/login',
                {form: {'userName' : 'testing123', 'password' : 'Testing123'}},
                function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
    });

    after(function(done) {
        requests.get('http://localhost:3000/members/logout', function(err, res, body) {
            done();
        });
    });

    describe('Slides Admin', function() {
        describe('/admin/allSlides', function() {
            it('should return 200 on successful request', function(done) {
                requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.not.equal({'500' : 'Unspecified error'});
                    done();
                });
            });
        });
        describe('/admin/addSlide', function() {
            // state
            var slideIdToRemove = null;

            afterEach(function(done) {
                // Cleanup of newly created slide
                var delData = {form: {'id' : slideIdToRemove}};
                requests.post('http://localhost:3000/admin/removeSlide', delData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK' });
                    done();
                });
            });

            it('should successfully add slide with default input', function(done) {
                var defaultSlideData = {form :
                    {
                        image: 'https://i.imgur.com/jwJoau0.jpg',
                        html: "<h1>We're the Temple ACM, and we <3 technology.</h1>"
                    }
                };
                requests.post('http://localhost:3000/admin/addSlide', defaultSlideData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    // ensures slide was actually added, and that success is not erroneous
                    requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                        body = JSON.parse(body);
                        expect(res.statusCode).to.equal(200);
                        if (body[0].html === defaultSlideData.form.html && body[0].image === defaultSlideData.form.image) {
                            slideIdToRemove = body[0]._id;
                            done();
                        } else {
                            throw new Error("Did not find correct slide in first position");
                        }
                    });
                });
            });
            it('should successfully add slide with arbitrary input', function(done) {
                var nonDefaultSlideData = {form :
                    {
                        image: 'http://img.pandawhale.com/104933-dickbutt-meme-Imgur-dick-butt-yfgk.png',
                        html: "This is dickbutt, he's pleased to meet you!"
                    }
                };
                requests.post('http://localhost:3000/admin/addSlide', nonDefaultSlideData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK' });
                    requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                        body = JSON.parse(body);
                        expect(res.statusCode).to.equal(200);
                        expect(body[0].html).to.deep.equal(nonDefaultSlideData.form.html);
                        expect(body[0].image).to.deep.equal(nonDefaultSlideData.form.image);
                        // by now it would have thrown were this not actually the correct slide,
                        // so ought to be safe. It's still lazy as all hell, though.
                        slideIdToRemove = body[0]._id;
                        done();
                    });
                });
            });
            it('should add new slides in the first position', function(done) {
                var slideData = {form :
                    {
                        image: 'https://i.imgur.com/jwJoau0.jpg',
                        html: "<h1>We're the Temple ACM, and we <3 technology. This is a test slide from the test 'should add new slides in the first position'.</h1>"
                    }
                };
                requests.post('http://localhost:3000/admin/addSlide', slideData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                        body = JSON.parse(body);
                        expect(res.statusCode).to.equal(200);
                        for (var i = 0; i < body.length; i++) {
                            if (body[i].order == 1) {
                                expect(body[i].html).to.deep.equal(slideData.form.html);
                                expect(body[i].image).to.deep.equal(slideData.form.image);
                                slideIdToRemove = body[i]._id;
                                done();
                            }
                        }
                    });
                });
            });
        });
        describe('/admin/updateSlide', function() {
            var objectid = null;
            before(function(done) {
                var defaultSlideData = {form :
                    {
                        image: 'https://i.imgur.com/jwJoau0.jpg',
                        html: "<h1>This is the slide created during the updateSlide tests.</h1>"
                    }
                };
                requests.post('http://localhost:3000/admin/addSlide', defaultSlideData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                        body = JSON.parse(body);
                        expect(res.statusCode).to.equal(200);
                        if (body[0].html === defaultSlideData.form.html && body[0].image === defaultSlideData.form.image) {
                            objectid = body[0]._id;
                            done();
                        } else {
                            throw new Error("Did not find correct slide in first position");
                        }
                    });
                });
            });

            after(function(done) {
                var delData = {form: {'id' : objectid}};
                requests.post('http://localhost:3000/admin/removeSlide', delData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    done();
                });
            });

            it('should successfully update the data when input is correct', function(done) {
                var updatedSlideData = { form:
                    {
                    image: 'https://i.imgur.com/jwJoau0.jpg',
                    html: "<h2> we've updated this html as part of testing! how does it look?</h2>",
                    _id: objectid,
                    order: 1
                    }
                };
                requests.post('http://localhost:3000/admin/updateSlide', updatedSlideData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                        body = JSON.parse(body);
                        expect(res.statusCode).to.equal(200);
                        var found = false;
                        for (var i = 0; i < body.length; i++) {
                            if (body[i]._id === updatedSlideData.form._id) {
                                if (body[i].image === updatedSlideData.form.image && body[i].html === updatedSlideData.form.html) {
                                    found = true;
                                    done();
                                }
                            }
                        }
                        if (found == false) {
                            throw new Error("Did not find properly updated slide");
                        }
                    });
                });
            });

            it('should return an appropriate error when incomplete input is sent', function(done) {
                var badData = {form :
                    {
                        image: 'http://i.imgur.com/3OFvy.png',
                        html: '<h1>YOU ARE ALL KINDS OF WRONG MOTHAFUCKA</h1>',
                    }
                };
                requests.post('http://localhost:3000/admin/updateSlide', badData, function(err, res, body) {
                    expect(res.statusCode).to.equal(500);
                    expect(JSON.parse(body)).to.deep.equal({'500' : 'Unspecified error'});
                    requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                        var found = false;
                        expect(res.statusCode).to.equal(200);
                        body = JSON.parse(body);
                        for (var i = 0; i < body.length; i++) {
                            if (body[i]._id === badData.form._id) {
                                if (body[i].image === badData.form.image && body[i].html === badData.form.html) {
                                    found = true;
                                }
                            }
                        }
                        if (found == true) {
                            throw new Error("Input erroneously inserted despite being incorrect");
                        } else {
                            done();
                        }
                    });
                });
            });
        });
        describe('/admin/removeSlide', function() {
            var slideToDelete = null;

            beforeEach(function(done) {
                var data = {form :
                    {
                        image: 'http://i.imgur.com/do5G4H5.gif',
                        html: 'This slide was created to test /admin/removeSlide'
                    }
                };
                requests.post('http://localhost:3000/admin/addSlide', data, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    requests.get('http://localhost:3000/admin/allSlides', function(err, res, body) {
                        expect(res.statusCode).to.equal(200);
                        body = JSON.parse(body);
                        expect(body).to.not.equal({'500' : 'Unspecified error'});
                        var found = false;
                        for (var i = 0; i < body.length; i++) {
                            if (body[i].image === data.form.image && body[i].html === data.form.html) {
                                slideToDelete = body[i]._id;
                                found = true;
                            }
                        }
                        if (found == true) {
                            done();
                        } else {
                            throw new Error("Added slide not found");
                        }
                    });
                });
            });

            it('should delete a specified slide successfully with proper input', function(done) {
                var deleteData = {form:
                    {
                        id: slideToDelete
                    }
                };

                requests.post('http://localhost:3000/admin/removeSlide', deleteData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200':'OK'});
                    done();
                });
            });

            it('should return the appropriate error when correct input is not given', function(done) {
                requests.post('http://localhost:3000/admin/removeSlide', function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'500' : 'Unspecified error'});
                });

                requests.post('http://localhost:3000/admin/removeSlide', {form: {'_id': slideToDelete}}, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'500' : 'Unspecified error'});

                    requests.post('http://localhost:3000/admin/removeSlide', {form: {'id': slideToDelete}}, function(err, res, body) {
                        expect(res.statusCode).to.equal(200);
                        expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                        done();
                    });
                });
            });
        });
    });

    describe('Officers Admin', function() {
        describe('/admin/addOfficer', function() {
            testAccountId = "5467e2cf55684e3b083f42e0";
            var cleanup = true;

            afterEach(function(done) {
                if (cleanup == true) {
                    removeData = {form: {'id': testAccountId}};

                    requests.post('http://localhost:3000/admin/removeOfficer', removeData, function(err, res, body) {
                        expect(res.statusCode).to.equal(200);
                        expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                        cleanup = true;
                        done();
                    });
                } else {
                    done();
                }
            });

            it('should add an officer given a bio and title', function(done) {
                var officerData = { form:
                    {
                        _id: testAccountId,
                        'bio': "I'm a test user designed to be an admin account with a full profile, for use in testing.",
                        'title': "Literally the Goddamn Batman"
                    }
                };
                requests.post('http://localhost:3000/admin/addOfficer', officerData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    requests.get('http://localhost:3000/members/officers', function(err, res, body) {
                        if (res.statusCode == 200) {
                            var officers = JSON.parse(body);
                            officers = officers["200"];
                            var found = false;
                            for (var i = 0; i < officers.length; i++) {
                                if (officers[i].bio === officerData.form.bio && officers[i].title === officerData.form.title) {
                                    found = true;
                                }
                            }
                            if (found == true) {
                                done();
                            } else {
                                throw new Error("Officer not found, test failed");
                            }
                        } else {
                            throw new Error("Officer retrieval failed");
                        }
                    });
                });
            });

            it('should add an officer given only a title', function(done) {
                officerData = {form: {'_id': testAccountId, 'title': 'Literally the Goddamn Batman'}};

                requests.post('http://localhost:3000/admin/addOfficer', officerData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});

                    requests.get('http://localhost:3000/members/officers', function(err, res, body) {
                        if (res.statusCode == 200) {
                            var officers = JSON.parse(body);
                            officers = officers['200'];
                            var found = false;
                            for (var i = 0; i < officers.length; i++) {
                                if (officers[i].title === officerData.form.title) {
                                    found = true;
                                }
                            }
                            if (found == true) {
                                cleanup = true;
                                done();
                            } else {
                                throw new Error('Officer not found, test failed');
                            }
                        } else {
                            throw new Error('Officer retrieval failed');
                        }
                    });
                });
            });

            it('should return appropriate error messages when invalid input is given', function(done) {
                var badData = {form: { '_id': testAccountId, 'bio': "I'm a bio without a title! I should never get into the database." }};
                requests.post('http://localhost:3000/admin/addOfficer', badData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'500' : 'Unspecified error'});
                    requests.get('http://localhost:3000/members/officers', function(err, res, body) {
                        if (res.statusCode == 200) {
                            var found = false;
                            stuff = JSON.parse(body);
                            stuff = stuff['200'];
                            for (var i = 0; i < stuff.length; i++) {
                                if (stuff[i].bio === badData.form.bio) {
                                    found = true;
                                }
                            }
                            if (found == true) {
                                throw new Error("Officer found despite invalid input, test failed");
                            } else {
                                cleanup = false;
                                done();
                            }
                        } else {
                            throw new Error("Officer retrieval failed");
                        }
                    });
                });
            });
        });

        describe('/admin/removeOfficer', function() {
            testAccountId = "5467e2cf55684e3b083f42e0";
            var cleanup = true;

            beforeEach(function(done) {
                officerData = {form: {'_id': testAccountId, 'title': 'Literally the Goddamn Batman'}};

                requests.post('http://localhost:3000/admin/addOfficer', officerData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                    done();
                })
            });

            afterEach(function(done) {
                if (cleanup == true) {
                    var removeData = {form: {'id' : testAccountId}};
                    requests.post('http://localhost:3000/admin/removeOfficer', removeData, function(err, res, body) {
                        expect(res.statusCode).to.equal(200);
                        expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});
                        done();
                    });
                } else {
                    cleanup = true;
                    done();
                }
            });

            it('should remove the officer successfully upon valid input', function(done) {
                var data = {form: {'id' : testAccountId}};

                requests.post('http://localhost:3000/admin/removeOfficer', data, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'200' : 'OK'});

                    requests.get('http://localhost:3000/members/officers', function(err, res, body) {
                        if (res.statusCode == 200) {
                            var officers = JSON.parse(body);
                            officers = officers['200'];
                            var found = false;
                            for (var i = 0; i < officers.length; i++) {
                                if (officers[i].title === "Literally the Goddamn Batman") {
                                    found = true;
                                }
                            }
                            if (found == true) {
                                throw new Error('Officer found despite successful response, test failed');
                            } else {
                                cleanup = false;
                                done();
                            }
                        } else {
                            throw new Error('Officer retrieval failed');
                        }
                    });
                });
            });

            it('should not remove anything and return error response when given invalid input', function(done) {
                requests.get('http://localhost:3000/members/officers', function(err, res, body) {
                    if (res.statusCode == 200) {
                        var originalOfficers = JSON.parse(body);
                        originalOfficers = originalOfficers['200'];

                        requests.post('http://localhost:3000/admin/removeOfficer', function(err, res, body) {
                            expect(res.statusCode).to.equal(200);
                            expect(JSON.parse(body)).to.deep.equal({'500' : 'Unspecified error'});

                            requests.get('http://localhost:3000/members/officers', function(err, res, body) {
                                if (res.statusCode == 200) {
                                    var newOfficers = JSON.parse(body);
                                    newOfficers = newOfficers['200'];
                                    expect(newOfficers).to.deep.equal(originalOfficers);
                                    done();
                                } else {
                                    cleanup = false;
                                    throw new Error("Fetching officers failed, test aborting");
                                }
                            });
                        });
                    } else {
                        cleanup = false;
                        throw new Error("Fetching officers failed, test aborting");
                    }
                });
            });
        });
    });

    describe('Members Admin', function() {
        describe('/admin/getMember', function() {
            it('should return the correct member object when valid ObjectID is sent', function(done) {
                var referenceMember = {
                    bio: "This is Kim Taeyeon. She's prettier than you.",
                    dateLastPaid: null,
                    dateRegistered: 1416970463483,
                    email: "testguy@testguy.edu",
                    facebook: "aoesnuthaqor",
                    firstName: "Testguy2",
                    github: "testguy2134",
                    lastName: "Testguy2",
                    major: "Computer Science & Mathematics",
                    membership: "2354234623",
                    officer: true,
                    paid: false,
                    password: "$2a$10$RX/1iRGkg9rwfYgP656oAelAW7XD1Ze2xAmF7hGNiEVSaZ4D5Yn06",
                    picture: "https://lh4.googleusercontent.com/-NRh5VP7HBSU/UbWAQJ9eYTI/AAAAAAAAAU8/_L0ej4SZW34/s630-fcrop64=1,000023bbfc5e8bbb/snsd%2Btaeyeon%2Bhigh%2Bcut%2Bmagazine%2B%25282%2529.jpg",
                    studentLevel: "Junior",
                    title: "Resident Kpop Idol",
                    twitter: "3408pgoen",
                    userName: "testing123"
                };
                var data = {form: {'_id' : '547540df3e7da89401e65294'}};
                requests.post('http://localhost:3000/admin/getMember', data, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.not.equal({'500' : 'Unspecified error'}); // don't think this works
                    var retObj = JSON.parse(body);
                    retObj = retObj['200'][0];
                    delete retObj._id;
                    expect(retObj).to.deep.equal(referenceMember);
                    done();
                });
            });

            it('should return the correct error response when sent invalid input', function(done) {
                data = {form: {'_id': '2134333'}}; //not ever a valid hexstring of an ObjectID

                requests.post('http://localhost:3000/admin/getMember', data, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'500' : 'Unspecified error'});
                    done();
                });
            });

            it('should return the appropriate error response when sent valid input that does not correspond to a user', function(done) {
                testData = {form: {'_id': '547340df5e75a89e01e65294'}}; // valid ObjectID hex string that isn't in the DB
                requests.post('http://localhost:3000/admin/getMember', testData, function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({'500' : 'Unspecified error'});
                    done();
                });
            });
        });

        describe('/admin/updateMember', function() {

        });
    });

    describe("Exports Admin", function() {
        describe('/admin/exports/csv', function() {
            it('should return a CSV file when requested by a logged-in officer', function(done) {
                requests.get('http://localhost:3000/admin/export/csv', function(err, res, body) {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['content-type']).to.deep.equal('text/csv; charset=utf-8');
                    done();
                });
            });
        });
    });
});
