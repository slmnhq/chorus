describe("chorus.views.Login", function() {
    beforeEach(function() {
        this.view = new chorus.views.Login({model: chorus.session});
        this.view.render();
    });

    it("should have a login form", function() {
        expect(this.view.$("form.login")).toExist();
    });

    it("requests the version string from the server", function() {
        expect(this.server.requests[0].url).toBe("/VERSION");
    })

    describe("when the version string is returned", function() {
        beforeEach(function() {
            this.server.requests[0].respond(200, {}, "THE_VERSION");
        });

        it("inserts the version string", function() {
            expect(this.view.$(".legal .version")).toHaveText("THE_VERSION")
        })
    })

    describe("attempting to login", function() {
        beforeEach(function() {
            this.view.model.set({ foo: "bar" })
            this.view.model.id = "foo"
            this.saveSpy = spyOn(this.view.model, "save");
            this.view.$("input[name=userName]").val("johnjohn");
            this.view.$("input[name=password]").val("partytime");
            this.view.$("form.login").submit();
        });

        it("sets attributes on the model", function() {
            expect(this.view.model.get("userName")).toBe("johnjohn");
            expect(this.view.model.get("password")).toBe("partytime");
        });

        it("clears other attributes on the model", function() {
            expect(_.size(this.view.model.attributes)).toBe(2);
        })

        it("configures the model for POST, not PUT", function() {
            expect(this.view.model.isNew()).toBeTruthy();
        })

        it("attempts to save the model", function() {
            expect(this.saveSpy).toHaveBeenCalled();
        });
    });

    describe("when the login fails", function() {
        beforeEach(function() {
            this.view.model.serverErrors = [
                { message: "Hi there" }
            ]
            this.view.render();
        });

        it("displays the error message", function() {
            expect(this.view.$(".errors").text()).toContain("Hi there")
        })
    });

    describe("when the login succeeds", function() {
        context("with no prior logins", function() {
            beforeEach(function() {
                this.navigationSpy = spyOn(chorus.router, "navigate");
                this.view.model.trigger('saved', this.view.model);
            });

            it("navigates to the dashboard", function() {
                expect(this.navigationSpy).toHaveBeenCalledWith("/", true);
            });
        });

        context("with a prior login from the same user that timed out", function() {
            beforeEach(function() {
                chorus.session.previousUserId = "2";
                chorus.session.pathBeforeLoggedOut = "/foo";
                chorus.session.set({user: new chorus.models.User({id: "2", userName: "iAmNumberTwo"})});

                this.navigationSpy = spyOn(chorus.router, "navigate");
                this.view.model.trigger('saved', this.view.model);
            });

            it("navigates to the page before forced logout", function() {
                expect(this.navigationSpy).toHaveBeenCalledWith("/foo", true);
            });
        });

        context("with a prior login from a different user that timed out", function() {
            beforeEach(function() {
                chorus.session.previousUserId = "2";
                chorus.session.pathBeforeLoggedOut = "/foo";
                chorus.session.set({user: new chorus.models.User({id: "3", userName: "iAmNumberThree"})});

                this.navigationSpy = spyOn(chorus.router, "navigate");
                this.navigationSpy.reset();
                this.view.model.trigger('saved', this.view.model);
            });

            xit("navigates to the dashboard", function() {
                expect(this.navigationSpy).toHaveBeenCalledWith("/", true);
            });
        })

    })
})
