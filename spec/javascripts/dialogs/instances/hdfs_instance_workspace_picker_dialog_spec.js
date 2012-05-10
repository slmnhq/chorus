describe("chorus.dialogs.HdfsInstanceWorkspacePicker", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved")

        stubModals();

        this.dialog = new chorus.dialogs.HdfsInstanceWorkspacePicker({model: new chorus.models.Instance(), activeOnly: true});
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

            it("checks the sandbox version", function() {
                expect(this.server.lastFetch().url).toBe("/edc/workspace/"+this.dialog.collection.at(1).id+"/sandboxDbVersion")
            });

            context("when the fetch completes", function () {
                beforeEach(function() {
                    spyOn(this.dialog, "launchSubModal").andCallThrough();
                });
                context("when there's no sandbox", function () {
                    beforeEach(function() {
                        this.dialog.sandboxVersion.serverErrors = [{message: "abc"}];
                        this.dialog.sandboxVersion.trigger("fetchFailed");
                    });

                    it("displays the error message", function() {
                        expect(this.dialog.$(".errors").text()).toContain("abc");
                    });

//                    it("does not open the create external dialog", function() {
//                        expect(this.dialog.launchSubModal).not.toHaveBeenCalled();
//                    })
                });

                context("when the gpdb version is less than 4.2", function () {
                    beforeEach(function() {
                        this.dialog.sandboxVersion.set({sandboxInstanceVersion: "4.1.1.1 build 1"})
                        this.server.lastFetch().succeed(this.dialog.sandboxVersion);
                    });
                    it("displays the errors message", function() {
                         expect(this.dialog.$(".errors").text()).toContainTranslation("hdfs_instance.gpdb_version.too_old")
                    });
                });

               context("when the gpdb version is more than 4.2", function () {
                   beforeEach(function() {
                       this.dialog.sandboxVersion.set({sandboxInstanceVersion: "4.2.1.1 build 1"})
                       this.server.lastFetch().succeed(this.dialog.sandboxVersion);
                   });

                   it("does not display the error message", function() {
                       expect(this.dialog.$(".errors").text()).toBe("");
                   });

//                   it("opens the Create External Table dialog", function() {
//                        expect(this.dialog.launchSubModal).toHaveBeenCalled();
//                   });

               });

            });
        });
    });
});
