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
            spyOn(this.dialog.model, "save").andCallThrough();
            this.workfile.set({"baseVersionNum": 1});
            this.workfile.set({"content": "new blood"});
            this.dialog.$("[name=commitMessage]").val("new commit")
            this.dialog.$("form").submit();
        });

        it("has WorkfileNewVersion as the model", function() {
            expect(this.dialog.model).toBeA(chorus.models.WorkfileNewVersion);
        });

        it("sets commit message on the model", function() {
            expect(this.dialog.model.get("commitMessage")).toBe("new commit");
        });

        it("saves the model with the fields from the form", function() {
            expect(this.dialog.model.save).toHaveBeenCalled()
        });

        describe("when the save completes", function() {
            beforeEach(function() {
                spyOn(this.dialog, 'closeModal');
                spyOnEvent(this.dialog.model, "autosaved");
                this.dialog.model.trigger("saved");
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("triggers autosaved", function() {
                expect("autosaved").toHaveBeenTriggeredOn(this.dialog.model);
            });
            it("sets the versionNum and versionFileId to the page model", function() {
                this.dialog.model.set({ "versionNum": 1000, "versionFileId" : "ID1"})
                this.completeSaveFor(this.dialog.model)
                expect(this.dialog.pageModel.get("versionNum")).toBe(this.dialog.model.get("versionNum"));
                expect(this.dialog.pageModel.get("versionFileId")).toBe(this.dialog.model.get("versionFileId"));

            });
        });
    });
});