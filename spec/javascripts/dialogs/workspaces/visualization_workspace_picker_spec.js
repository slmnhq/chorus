describe("chorus.dialogs.VisualizationWorkspacePicker", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved")

        stubModals();
        this.dialog = new chorus.dialogs.VisualizationWorkspacePicker();
        this.dialog.launchModal();

        this.workspace1 = fixtures.workspace({name: "Foo"});
        this.workspace2 = fixtures.workspace({name: "Bar"});
        this.workspaces = fixtures.workspaceSet([this.workspace1, this.workspace2]);
    });

    it("has the correct title and button", function() {
        expect(this.dialog.title).toMatchTranslation("visualization.workspace_picker.title");
        expect(this.dialog.buttonTitle).toMatchTranslation("visualization.workspace_picker.button");
    });

    it("only displays the active workspaces", function() {
        expect(this.dialog.options.activeOnly).toBeTruthy();
    });

    context("when the fetch completes", function() {
        beforeEach(function() {
            this.server.lastFetch().succeed(this.workspaces.models);
        });

        it("renders all the workspaces", function() {
            expect(this.dialog.$("li").length).toBe(2);
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