describe("chorus.models.User", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'User';
        this.model = new models.User();
    });

    it("has the correct showUrlTemplate", function() {
        expect(this.model.showUrlTemplate).toBe("users/{{userName}}");
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("user/{{userName}}");
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
                var expectedUrl = "/edc/workspace/?user=" + this.user.get("userName");
                expect(this.server.requests[0].url).toBe(expectedUrl);
            });
        });
    });

    describe("#performValidation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
            spyOn(this.model, "requirePattern").andCallThrough();
            spyOn(this.model, "requireConfirmation").andCallThrough();
        })

        it("should return a truthy value for a valid user", function() {
            this.model.set(fixtures.modelFor('fetch'));
            this.model.set({ password : "foo", passwordConfirmation : "foo" })
            expect(this.model.performValidation()).toBeTruthy();
        });

        _.each(["firstName", "lastName", "userName"], function(attr) {
            it("requires " + attr, function() {
                this.model.performValidation();
                expect(this.model.require).toHaveBeenCalledWith(attr);
            })
        })

        it("requires emailAddress", function() {
            this.model.performValidation();
            expect(this.model.requirePattern).toHaveBeenCalledWith("emailAddress", /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/)
        })

        it("requires password confirmation", function() {
            this.model.performValidation();
            expect(this.model.requireConfirmation).toHaveBeenCalledWith("password");
        })
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
});
