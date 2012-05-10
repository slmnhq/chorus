describe("chorus.dialogs.HdfsInstanceWorkspacePicker", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved")

        stubModals();

        this.dialog = new chorus.dialogs.HdfsInstanceWorkspacePicker();
        this.dialog.launchModal();

        this.workspace1 = newFixtures.workspace({name: "Foo"});
        this.workspace2 = newFixtures.workspace({name: "Bar"});
        this.workspaces = new chorus.collections.WorkspaceSet([this.workspace1, this.workspace2]);
    });

    it("has the correct title and button", function() {
        expect(this.dialog.title).toMatchTranslation("hdfs_instance.workspace_picker.title");
        expect(this.dialog.submitButtonTranslationKey).toBe("hdfs_instance.workspace_picker.button");
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

//            it("checks the sandbox version", function() {
//                expect(this.server.lastFetch().url).toBe("/workspace/sandboxVersion")
//            });
//
//            context("when the fetch completes", function () {
//                beforeEach(function() {
//
//                });
//
//                context("when there's no sandbox", function () {
//                    it("", function() {
//
//                    });
//                });
//
//                context("when the gpdb version is less than 4.2", function () {
//                    it("", function() {
//
//                    });
//                });
//
//                context("when the gpdb version is more than 4.2", function () {
//                    it("", function() {
//
//                    });
//                });
//
//            });
//            it("closes the dialog", function() {
//                expect(this.dialog.closeModal).toHaveBeenCalled();
//            });
        });
    });
});
