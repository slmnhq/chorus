describe("chorus.dialogs.WorkfileNewVersion", function() {
    beforeEach(function() {
        this.workfile = newFixtures.workfile.sql({
            id: 55,
            workspace: { id: 44 },
            versionInfo: { versionNum: 4 },
            latestVersionNum: 4
        });
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
            spyOn(Backbone.Model.prototype, "save").andCallThrough();
            this.workfile.set({"content": "new blood"});
            this.dialog.$("[name=commitMessage]").val("new commit")
            this.dialog.$("form").submit();
        });

        it("has Workfile as the model", function() {
            expect(this.dialog.model).toBeA(chorus.models.Workfile);
        });

        it("sets commit message on the model", function() {
            expect(this.dialog.model.get("commitMessage")).toBe("new commit");
        });

        it("saves the model with the fields from the form with the correct post url", function() {
            expect(Backbone.Model.prototype.save).toHaveBeenCalled()
            expect(this.server.lastCreate().url).toBe("/workfiles/55/versions");
        });

        describe("when the save completes", function() {
            beforeEach(function() {
                spyOn(this.dialog, 'closeModal');
                this.invalidatedSpy = jasmine.createSpy("invalidated");
                this.workfile.bind("invalidated", this.invalidatedSpy);
                this.dialog.model.trigger("saved");
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
            
            it("invalidates the page model", function() {
              expect(this.invalidatedSpy).toHaveBeenCalled();
            })

            it("sets the versionNum and versionFileId to the page model", function() {
                this.dialog.model.set({ "versionNum": 1000, "versionFileId" : "ID1"})
                this.server.lastCreate().succeed(this.dialog.model);
                expect(this.dialog.pageModel.get("versionNum")).toBe(this.dialog.model.get("versionNum"));
                expect(this.dialog.pageModel.get("versionFileId")).toBe(this.dialog.model.get("versionFileId"));

            });
        });
    });
});
