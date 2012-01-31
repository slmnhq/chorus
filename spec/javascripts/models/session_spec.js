describe("chorus.models.Session", function() {
    var models = chorus.models;
    beforeEach(function() {
        this.savedAuthCookie = $.cookie("authid")
        this.savedUserIdCookie = $.cookie("userId");
        fixtures.model = 'Session';
    });

    afterEach(function() {
        $.cookie("authid", this.savedAuthCookie);
        $.cookie("userId", this.savedUserIdCookie);
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
                this.model.set({ foo: "bar", bro: "baz" });
                this.model._user = fixtures.user();
                this.model.sandboxPermissionsCreated['4'] = true;
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

                it("clears all attributes in the model", function() {
                    expect(_.size(this.model.attributes)).toBe(0);
                    expect(this.model._user).toBeUndefined();
                    expect(this.model.sandboxPermissionsCreated).toEqual({});
                })
            })
        })
    });

    describe("loggedIn", function() {
        beforeEach(function() {
            this.model = new models.Session();
        });

        context("when there is an authid cookie", function() {
            beforeEach(function() {
                $.cookie("authid", "1234");
            })

            it("returns false when there is no _user", function() {
                expect(this.model.loggedIn()).toBeFalsy();
            });

            it("returns true when the user has been fetched", function() {
                this.model._user = fixtures.user();
                expect(this.model._user.get('id')).toBeTruthy();
                expect(this.model.loggedIn()).toBeTruthy();
            });
        });

        context("when there is no authid cookie", function() {
            beforeEach(function() {
                $.cookie("authid", null);
                this.model._user = fixtures.user();
            })

            it("returns false", function() {
                expect(this.model.loggedIn()).toBeFalsy();
            })
        })
    });

    describe("#fetch", function() {
        beforeEach(function() {
            this.model = new models.Session({ id : "1234", foo : "bar" });
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
                expect(this.model.user()).toBeTruthy();
                
                this.server.respondWith(
                    'GET',
                    '/edc/auth/checkLogin/?authid=1234',
                    this.prepareResponse({ status :"fail", message : "no way", resource : []}));

                this.server.respond();
            })

            it("triggers needsLogin", function() {
                expect(this.needsLoginSpy).toHaveBeenCalled();
            })

            it("clears the session attributes", function() {
                expect(_.keys(this.model.attributes).length).toBe(0);
            });

            it("clears the session error messages", function() {
                expect(this.model.serverErrors).toBeUndefined();
            })

            it("clears the memorized user", function() {
                expect(this.model.user()).toBeFalsy();
            });
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

    describe("validation", function() {
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
            expect(this.model.require).toHaveBeenCalledWith("userName", undefined);
        });

        it("requires password", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("password", undefined);
        });
    });

    describe("#user", function() {
        beforeEach(function() {
            this.session = new models.Session()
        });

        context("when a user has been fetched", function() {
            beforeEach(function() {
                this.session._user = fixtures.user();
            })

            it("returns a User", function() {
                expect(this.session.user() instanceof(chorus.models.User)).toBeTruthy();
            });

            it("returns the same user object", function() {
                expect(this.session.user()).toBe(this.session.user())
            });
        });

        it("returns false when the user has not been fetched", function() {
            expect(this.session.user()).toBeFalsy();
        });

    });


});
