describe("chorus.dialogs.InstanceAccount", function() {
    beforeEach(function() {
        this.instance = fixtures.instance();
        var launchElement = $("<a></a>").data("title", t("instances.account.add.title"));
        this.dialog = new chorus.dialogs.InstanceAccount({ pageModel: this.instance, launchElement: launchElement });
        this.dialog.launchModal();
        this.dialog.render();
    });

    describe("#render", function() {
        it("has the right title based on the launch element", function() {
            expect(this.dialog.title).toMatchTranslation("instances.account.add.title")
        });
    });

    describe("#makeModel", function() {
        it("gets the current user's account on the instance that is the current page model", function() {
            expect(this.dialog.model).toBe(this.instance.accountForCurrentUser());
        });
    });

    describe("when the form is submitted", function() {
        beforeEach(function() {
            this.account = this.dialog.model;
            spyOn(this.account, 'save').andCallThrough();

            this.dialog.$("input[name=dbUserName]").val("office");
            this.dialog.$("input[name=dbPassword]").val("howard875huge");
            this.dialog.$("form").submit();
        });

        it("sets the database username and password fields on the model", function() {
            expect(this.account.get("dbUserName")).toBe("office");
            expect(this.account.get("dbPassword")).toBe("howard875huge");
        });

        it("saves the model with the fields from the form", function() {
            expect(this.account.save).toHaveBeenCalled();
        });

        describe("when the save completes", function() {
            beforeEach(function() {
                spyOn(this.dialog, 'closeModal').andCallThrough();
                this.account.trigger("saved");
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });
    });

    describe("when options.reload=true", function() {
        beforeEach(function() {
            spyOn(chorus.router, "reload");
            this.dialog.options.reload = true;
        });

        describe("after saving", function() {
            beforeEach(function() {
                this.dialog.$("input[name=dbUserName]").val("office");
                this.dialog.$("input[name=dbPassword]").val("howard875huge");
                this.dialog.$("form").submit();
            });

            it("calls chorus.router.reload() after saving", function() {
                expect(chorus.router.reload).not.toHaveBeenCalled();
                this.server.completeSaveFor(this.dialog.model);
                expect(chorus.router.reload).toHaveBeenCalled();
            });

            it("does not navigate back", function() {
                this.server.completeSaveFor(this.dialog.model);
                expect(window.history.back).not.toHaveBeenCalled();
            });
        });

        describe("when the dialog is dismissed", function() {
            it("goes back one page in the browser", function() {
                this.dialog.$("button.cancel").click();
                expect(window.history.back).toHaveBeenCalled();
            });
        });
    });
});
