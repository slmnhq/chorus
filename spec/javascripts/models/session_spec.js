describe("chorus.models.Session", function() {
    var models = chorus.models;
    beforeEach(function() {
        this.savedAuthCookie = $.cookie("authid")
        this.savedUsernameCookie = $.cookie("userName");
        fixtures.model = 'Session';
    });

    afterEach(function() {
        $.cookie("authid", this.savedAuthCookie);
        $.cookie("userName", this.savedUsernameCookie);
    })

    describe("#save", function() {
        beforeEach(function() {
            this.model = new models.Session({ userName : "johnjohn", password : "partytime"});
            this.model.save();
        });

        it("has the right url", function() {
            expect(this.server.requests[0].url).toBe("/edc/auth/login/");
        });

        it("has the right method", function() {
            expect(this.server.requests[0].method).toBe("POST");
        });

    });

    describe("saved", function() {
        beforeEach(function() {
            $.cookie("userName", null)
            this.model = new models.Session({ userName : "ponyParty", password : "partytime"});
            this.model.trigger("saved");
        });
        it("sets the authUser cookie", function() {
            expect($.cookie("userName")).toBe("ponyParty")
        })

    });

    describe("#logout", function() {
        beforeEach(function() {
            this.model = new models.Session();
            this.needsLoginSpy = jasmine.createSpy();
            this.model.bind("needsLogin", this.needsLoginSpy);
            spyOn(chorus.router, "navigate")
            $.cookie("authid", "1234");
        });

        afterEach(function() {
            $.cookie("authid", null);
        });

        context("when the model has errors", function() {
            beforeEach(function() {
                this.model.set({ errors : true });
                this.model.logout();
            })

            it("does not call the logout API", function() {
                expect(this.server.requests.length).toBe(0);
            });

            it("triggers needsLogin", function() {
                expect(this.needsLoginSpy).toHaveBeenCalled();
            })
        })

        context("when the model does not have errors", function() {
            beforeEach(function() {
                this.model.logout();
            })

            it("calls the logout API", function() {
                expect(this.server.requests[0].url).toBe("/edc/auth/logout/?authid=1234");
            });

            describe("and the server responds", function() {
                beforeEach(function() {
                    this.server.respondWith(
                        'GET',
                        '/edc/auth/logout/?authid=1234',
                        this.prepareResponse({"message":[],"status":"ok","requestId":2694,"resource":[],"method":"GET","resourcelink":"/edc/auth/logout/","pagination":null,"version":"0.1"}));

                    this.server.respond();
                })

                it("triggers needsLogin", function() {
                    expect(this.needsLoginSpy).toHaveBeenCalled();
                })
            })
        })
    });

    describe("#user", function() {
        beforeEach(function() {
            this.model = new models.Session();
            this.needsLoginSpy = jasmine.createSpy();
            this.model.bind("needsLogin", this.needsLoginSpy);
            chorus.session = this.model;
        });

        afterEach(function() {
            chorus.session = null;
        })


        describe("when there is a cookie", function() {
            beforeEach(function() {
                $.cookie("userName", "edcadmin");
            });

            it("returns a user with the correct userName", function() {
                expect(this.model.user().get("userName")).toBe("edcadmin");
            });
        });

        describe("when there isn't a cookie", function() {
            beforeEach(function() {
                $.cookie("userName", null);
            });
            it("should trigger needsLogin on user request", function() {
                var user = this.model.user();
//                expect(user).toBeUndefined();
                expect(this.needsLoginSpy).toHaveBeenCalled();
            });
        });
    });

    describe("#fetch", function() {
        beforeEach(function() {
            this.model = new models.Session();
            this.needsLoginSpy = jasmine.createSpy();
            $.cookie("authid", "1234");
            this.model.bind("needsLogin", this.needsLoginSpy);
            this.model.fetch();
        });

        afterEach(function() {
            $.cookie("authid", null);
        });

        it("has the correct url", function() {
            expect(this.server.requests[0].url).toBe("/edc/auth/checkLogin/?authid=1234");
        });

        context("when the session is valid", function() {
            beforeEach(function() {
                this.server.respondWith(
                    'GET',
                    '/edc/auth/checkLogin/?authid=1234',
                    this.prepareResponse({ status :"ok"}));

                this.server.respond();
            })

            it("does not trigger needsLogin", function() {
                expect(this.needsLoginSpy).not.toHaveBeenCalled();
            })
        })

        context("when the session is not valid", function() {
            beforeEach(function() {
                this.server.respondWith(
                    'GET',
                    '/edc/auth/checkLogin/?authid=1234',
                    this.prepareResponse({ status :"fail"}));

                this.server.respond();
            })

            it("triggers needsLogin", function() {
                expect(this.needsLoginSpy).toHaveBeenCalled();
            })
        })
    })

    describe("#check", function() {
        beforeEach(function() {
            this.model = new models.Session();
            spyOn(this.model, "fetch")
        });

        context("when the destination route is the login page", function() {
            beforeEach(function() {
                this.model.check("Login");
            })

            it("does not fetch itself", function() {
                expect(this.model.fetch).not.toHaveBeenCalled();
            })
        })

        context("when the destination route is the Logout page", function() {
            beforeEach(function() {
                this.model.check("Logout");
            })

            it("does not fetch itself", function() {
                expect(this.model.fetch).not.toHaveBeenCalled();
            })
        })

        context("when the destinationRoute is Login", function() {
            beforeEach(function() {
                this.model.check("Dashboard");
            })

            it("fetches itself", function() {
                expect(this.model.fetch).toHaveBeenCalled();
            })
        })

        context("when the destinationRoute is not Login", function() {
            it("fetches self", function() {

            })
        })
    })

    describe("#performValidation", function() {
        beforeEach(function() {
            this.model = new models.Session();
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid session", function() {
            this.model.set({ userName : "barn", password : "door" });
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires userName", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("userName");
        });

        it("requires password", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("password");
        });
    });

});
