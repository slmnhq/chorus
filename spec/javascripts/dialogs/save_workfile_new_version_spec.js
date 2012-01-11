describe("chorus.dialogs.WorkfileNewVersion", function() {
    beforeEach(function() {
        this.workfile = fixtures.workfile();
        var launchElement = $("<a></a>");
        this.dialog = new chorus.dialogs.WorkfileNewVersion({ pageModel: this.workfile, launchElement: launchElement });
        this.dialog.render();
    });

    describe("#render", function() {
        it("has the right title based on the launch element", function() {
            expect(this.dialog.title).toMatchTranslation("workfile.new_version_dialog.title")
        });
    });

    describe("when the form is submitted", function() {
        beforeEach(function() {
            spyOn(this.dialog.model, "save");
            this.workfile.set({"baseVersionNum": 1});
            this.workfile.set({"content": "new blood"})
            this.dialog.$("[name=commitMessage]").val("new commit")
            this.dialog.$("form").submit();
        });

        it("sets commit message on the model", function() {
            expect(this.dialog.model.get("commitMessage")).toBe("new commit");
        });

        it("saves the model with the fields from the form", function() {
            expect(this.dialog.model.save).toHaveBeenCalled();
        });

        describe("when the save completes", function() {
            beforeEach(function() {
                spyOn(this.dialog, 'closeModal');
                this.dialog.model.trigger("saved");
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });
    });
});