describe("ImportGnipStream", function () {
    beforeEach(function () {
        this.gnip = rspecFixtures.gnipInstance();
        this.dialog = new chorus.dialogs.ImportGnipStream({model:this.gnip });
    });

    describe("render", function () {
        beforeEach(function () {
            this.dialog.render();
        });
        it("has the correct title", function () {
            expect(this.dialog.$("h1")).toContainTranslation("gnip.import_stream.title");
        });

        it("has 'import into a sandbox' fieldset legend", function() {
           expect(this.dialog.$("fieldset legend")).toContainTranslation("gnip.import_stream.import_into_sandbox")
           expect(this.dialog.$("fieldset legend a.select_workspace")).toContainTranslation("gnip.import_stream.select_workspace")
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
            });
        });
    });

});