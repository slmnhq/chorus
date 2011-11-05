describe("chorus.views.Login", function() {
    beforeEach(function() {
        this.loadTemplate("login");
        fixtures.model = "Login";
        this.view = new chorus.views.Login({model : new chorus.models.Session()});
        this.view.render();
    });

    it("should have a login form", function() {
        expect(this.view.$("form.login")).toExist();
    });

    describe("attempting to login", function() {
        beforeEach(function() {
            this.saveSpy = spyOn(this.view.model, "save");
            this.view.$("input[name=userName]").val("johnjohn");
            this.view.$("input[name=password]").val("partytime");
            this.view.$("form.login").submit();
        });

        it("sets attributes on the model", function() {
            expect(this.view.model.get("userName")).toBe("johnjohn");
            expect(this.view.model.get("password")).toBe("partytime");
        });

        it("attempts to save the model", function() {
            expect(this.saveSpy).toHaveBeenCalled();
        });
    });

    describe("when the login fails", function() {
        beforeEach(function() {
            this.view.model.set({ errors : [
                { message: "Hi there" }
            ] });
        });

        it("displays the error message", function() {
            expect(this.view.$(".errors").text()).toContain("Hi there")
        })
    });

    describe("when the login succeeds", function() {
        beforeEach(function() {
            this.user = new chorus.models.User();
            spyOn(chorus, "fetchUser").andReturn(this.user);

            this.navigationSpy = spyOn(chorus.router, "navigate");
            this.view.model.trigger('saved', this.view.model);
        });

        it("navigates to the dashboard", function() {
            expect(this.navigationSpy).toHaveBeenCalledWith("/", true);
        });

        it("resets chorus.user", function() {
            expect(chorus.user).toBe(this.user);
        })
    })
})
