describe("ImportGnipStream", function () {
    beforeEach(function () {
        this.gnip = rspecFixtures.gnipInstance();
        this.dialog = new chorus.dialogs.ImportGnipStream();
    });

    it("uses a GnipStream model", function() {
       expect(this.dialog.resource).toBeA(chorus.models.GnipStream);
    });

    describe("render", function () {
        beforeEach(function () {
            this.dialog.render();
        });
        it("has the correct title", function () {
            expect(this.dialog.$("h1")).toContainTranslation("gnip.import_stream.title");
        });

        it("has 'import into a sandbox' fieldset legend", function() {
           expect(this.dialog.$("fieldset legend")).toContainTranslation("gnip.import_stream.import_into_sandbox");
           expect(this.dialog.$("fieldset legend a.select_workspace")).toContainTranslation("gnip.import_stream.select_workspace");
        });

        describe("clicking on Select workspace link", function () {
            beforeEach(function () {
                this.modalSpy = stubModals();
                this.dialog.$("a.select_workspace").click();
            });

            it("should launch the select workspace picker dialog", function() {
                expect(this.modalSpy.lastModal()).toBeA(chorus.dialogs.ImportStreamWorkspacePicker);
            });

            describe("after workspace is selected", function () {
                beforeEach(function () {
                    this.workspace = rspecFixtures.workspace({name: "WorkspaceForGnip"});
                    this.dialog.workspace_picker.trigger("workspace:selected", this.workspace);
                });
                it("updates the workspace selection link", function () {
                    expect(this.dialog.$("legend a")).toHaveText("WorkspaceForGnip");
                });

                context("clicking on submit", function () {
                    beforeEach(function () {
                        spyOn(this.dialog.model, "save");
                        this.dialog.$("input[name=toTable]").val("MyNewTable");
                        this.dialog.$(".submit").click();
                    });
                    it("calls save on the model", function () {
                        expect(this.dialog.model.get("workspaceId")).toBe(this.workspace.id);
                        expect(this.dialog.model.get("toTable")).toBe("MyNewTable");
                        expect(this.dialog.model.save).toHaveBeenCalled();
                    });
                });
            });
        });
    });

});