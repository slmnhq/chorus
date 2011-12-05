describe("chorus.dialogs.ChangePassword", function() {
    beforeEach(function() {
        this.loadTemplate("change_password");
        this.user = new chorus.models.User({ userName: "john" });
        this.view = new chorus.dialogs.ChangePassword({ model : this.user });
        this.view.render();
    });

    describe("#render", function() {
        it("has the right title", function() {
            
        });
    });

    describe("when the user clicks submit", function() {
        beforeEach(function() {
            spyOn(this.user, "save");
            this.view.$("input[name=password]").val("my_cool_password");
            this.view.$("input[name=passwordConfirmation]").val("my_cool_password_conf");
            this.view.$("form").submit();
        });

        it("calls #save on the user after setting its password and passwordConfirmation", function() {
            expect(this.user.get("password")).toBe("my_cool_password");
            expect(this.user.get("passwordConfirmation")).toBe("my_cool_password_conf");
            expect(this.user.save).toHaveBeenCalled();
        });

        describe("when the save request completes", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                this.user.trigger("saved");
            });

            it("closes the dialog box", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            });
        });
    })
});
