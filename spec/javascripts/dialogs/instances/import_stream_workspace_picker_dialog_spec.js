describe("chorus.dialogs.ImportStreamWorkspacePicker", function() {
    beforeEach(function() {
        stubModals();
        this.workspaces = rspecFixtures.workspaceSet();
        this.dialog = new chorus.dialogs.ImportStreamWorkspacePicker();
        this.dialog.launchModal();
    });

    it("has the right title", function () {
        expect(this.dialog.$("h1")).toContainTranslation("gnip.import_stream.select_workspace_title")
        expect(this.dialog.submitButtonTranslationKey).toBe("gnip.import_stream.select_workspace");
    });

    it("only fetches the active workspaces", function() {
        expect(this.dialog.collection.attributes.active).toBeTruthy();
    });

    context("when the fetch completes", function() {
        beforeEach(function() {
            this.server.lastFetch().succeed(this.workspaces.models);
        });

        it("renders all the workspaces", function() {
            expect(this.dialog.$("li").length).toBe(this.workspaces.length);
        });

        context("when a workspace is selected", function() {
            beforeEach(function() {
                spyOn(this.dialog, "closeModal");
                spyOnEvent(this.dialog, "workspace:selected");
                this.dialog.$("li:eq(1)").click();
                this.dialog.$("button.submit").click();
            });

            it("triggers an event with the workspace model", function() {
                expect("workspace:selected").toHaveBeenTriggeredOn(this.dialog, [this.dialog.collection.at(1)]);
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });
        });
    });
});