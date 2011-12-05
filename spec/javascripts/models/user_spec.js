describe("chorus.models.User", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'User';
        this.model = new models.User();
    });

    it("has the correct showUrlTemplate", function() {
        expect(this.model.showUrlTemplate).toBe("users/{{id}}");
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("user/{{id}}");
    });

    describe("#workspaces", function() {
        beforeEach(function() {
            this.user = new models.User({userName: "dr_charlzz"});
            this.workspaces = this.user.workspaces();
        });

        it("returns an instance of WorkspaceSet", function() {
            expect(this.workspaces instanceof chorus.models.WorkspaceSet).toBeTruthy();
        });

        it("returns the same instance every time", function() {
            expect(this.user.workspaces()).toBe(this.workspaces);
        });

        context("when the workspaces instance raises its reset event", function() {
            it("raises the changed event on the user instance", function() {
                var spy = jasmine.createSpy("changeHandler");
                this.user.bind("change", spy);
                this.workspaces.trigger("reset");
                expect(spy).toHaveBeenCalled();
            });

            it("only fires the change event once, even if the method was called multiple times", function() {
                this.user.workspaces();
                this.user.workspaces();
                var spy = jasmine.createSpy("changeHandler");
                this.user.bind("change", spy);
                this.workspaces.trigger("reset");
                expect(spy.calls.length).toBe(1);
            });
        });

        context("when fetched", function() {
            beforeEach(function() {
                this.workspaces.fetch();
            });

            it("hits the right url for that user", function() {
                var expectedUrl = "/edc/workspace/?user=" + this.user.get("userName") + "&page=1&rows=50";
                expect(this.server.requests[0].url).toBe(expectedUrl);
            });
        });
    });

    describe("#destroy", function() {
        it("should make a delete request", function() {
            //testing that the idAttribute is set properly
            this.model.set({ id : "27" });
            this.model.destroy();
            expect(this.server.requests[0].url).toBe(this.model.url());
        });
    });

    describe("#performValidation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
            spyOn(this.model, "requirePattern").andCallThrough();
            spyOn(this.model, "requireConfirmation").andCallThrough();
        });

        it("should return a truthy value for a valid user", function() {
            this.model.set(fixtures.modelFor('fetch'));
            this.model.set({ password : "foo", passwordConfirmation : "foo" });
            expect(this.model.performValidation()).toBeTruthy();
        });

        _.each(["firstName", "lastName", "userName"], function(attr) {
            it("requires " + attr, function() {
                this.model.performValidation();
                expect(this.model.require).toHaveBeenCalledWith(attr);
            });
        });

        it("requires emailAddress", function() {
            this.model.performValidation();
            expect(this.model.requirePattern).toHaveBeenCalledWith("emailAddress", /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/);
        });


        context("when the user is new", function() {
            beforeEach(function() {
                this.model = new chorus.models.User();
                this.model.set({
                    firstName: "bob",
                    lastName: "jenkins",
                    userName: "bobjenk",
                    emailAddress: "bobj@raisetheroof.us"
                });
            });

            context("when there is a password confirmation", function() {
                it("returns true", function() {
                    this.model.set({ password : "secret", passwordConfirmation: "secret" });
                    expect(this.model.performValidation()).toBeTruthy();
                });
            });

            context("when there is no password confirmation", function() {
                it("returns false", function() {
                    this.model.set({ password : "secret" });
                    expect(this.model.performValidation()).toBeFalsy();
                });
            });
        });

        context("when the user is already saved", function() {
            beforeEach(function() {
                this.model = new chorus.models.User();
                this.model.set({
                    id: 5,
                    firstName: "bob",
                    lastName: "jenkins",
                    userName: "bobjenk",
                    password: "original_password",
                    passwordConfirmation: "original_password",
                    emailAddress: "bobj@raisetheroof.us"
                });
                this.model.save();
                this.model.change();
            });

            context("when the password has not changed", function() {
                it("returns true", function() {
                    this.model.set({ emailAddress : "bobjanky@coolpalace.us" });
                    expect(this.model.performValidation()).toBeTruthy();
                });
            });

            context("when the password has changed and no confirmation is specified", function() {
                it("returns false", function() {

                    // when setting the password, we need to set 'silent' to true,
                    // so that later, when we perform validation, we can tell that
                    // the password has changed

                    this.model.set({ password : "new_password" }, { silent : true });
                    expect(this.model.performValidation()).toBeFalsy();
                });
            });
        });
    });

    describe("#imageUrl", function() {
        it("uses the right URL", function(){
            var user = new models.User({userName: 'foo'});
            expect(user.imageUrl()).toBe("/edc/userimage/foo?size=original");
        });

        it("accepts the size argument", function(){
            var user = new models.User({userName: 'foo'});
            expect(user.imageUrl({size: "icon"})).toBe("/edc/userimage/foo?size=icon");
        });
    });

    describe("#picklistImageUrl", function() {
        it("uses the right URL", function(){
            var user = new models.User({userName: 'foo'});
            expect(user.picklistImageUrl()).toBe("/edc/userimage/foo?size=original");
        });
    })

    describe("#displayName", function() {
        beforeEach(function() {
            this.model.set({ firstName : "Danny", lastName : "Burkes" });
        })

        it("returns the full name", function() {
            expect(this.model.displayName()).toBe("Danny Burkes");
        })
    })
});
