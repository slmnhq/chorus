describe("chorus.dialogs.HdfsInstanceWorkspacePicker", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved");

        stubModals();

        this.dialog = new chorus.dialogs.HdfsInstanceWorkspacePicker({
            model: fixtures.hdfsEntryDir({
                hadoopInstance : rspecFixtures.hadoopInstance({ id: 1234 }),
                path: '/data',
                name: 'foo'
            }),
            activeOnly: true
        });
        this.dialog.launchModal();

        this.workspace1 = rspecFixtures.workspace({name: "Foo"});
        this.workspace2 = rspecFixtures.workspace({name: "Bar"});
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
                expect(this.server.lastFetch().url).toBe("/workspace/"+this.dialog.collection.at(1).id+"/sandboxDbVersion")
            });

            context("when the fetch completes", function () {
                beforeEach(function() {
                    spyOn(this.dialog, "launchSubModal");
                });
                context("when there's no sandbox", function () {
                    beforeEach(function() {
                        this.dialog.sandboxVersion.trigger("fetchFailed", {serverErrors: { fields: { a: { GENERIC: {message: "abc"} } } }});
                    });

                    it("displays the error message", function() {
                        expect(this.dialog.$(".errors").text()).toContain("abc");
                    });

                    it("does not open the create external dialog", function() {
                        expect(this.dialog.launchSubModal).not.toHaveBeenCalled();
                    })
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

                   it("fetches the list of hdfs files", function() {
                        expect(this.server.lastFetch().url).toMatchUrl("/hadoop_instances/1234/files/%2Fdata%2Ffoo", {paramsToIgnore: ["page", "rows"]})
                   });

                   context("when the hdfs entries fetch completes", function() {
                       beforeEach(function() {
                           var hdfsFiles = [
                               fixtures.hdfsEntryFileJson(),
                               fixtures.hdfsEntryFileJson(),
                               fixtures.hdfsEntryBinaryFileJson(),
                               fixtures.hdfsEntryDirJson()
                           ];
                           this.server.completeFetchFor(this.dialog.hdfsFiles, hdfsFiles);
                       });

                       it("doesn't open the Create External Table dialog", function() {
                           expect(this.dialog.launchSubModal).not.toHaveBeenCalledWith(this.dialog.externalTableDialog);
                       });

                       it("filters out directories", function() {
                           expect(this.dialog.externalTableDialog.collection.length).toBe(3);
                       });

                       it("fetches the first item in the collection", function() {
                           expect(this.dialog.externalTableDialog.csv).toHaveBeenFetched();
                       })

                       context("when the fetch for hdfs file sample completes", function () {
                           beforeEach(function() {
                               this.server.completeFetchFor(this.dialog.externalTableDialog.csv);
                           });
                           it("opens the Create External Table dialog, passing the workspace information", function() {
                               expect(this.dialog.launchSubModal).toHaveBeenCalledWith(this.dialog.externalTableDialog);
                               expect(this.dialog.externalTableDialog.options.workspaceId).toEqual(this.workspace1.id);
                               expect(this.dialog.externalTableDialog.options.workspaceName).toEqual("Foo");
                           });
                       });
                   });

                   context("when the hdfs entries fetch completes with no text files", function () {
                       beforeEach(function() {
                            var hdfsFiles2 = [
                               fixtures.hdfsEntryDirJson()
                           ];
                           this.server.completeFetchFor(this.dialog.hdfsFiles, hdfsFiles2);

                       });
                       it("displays error when the directory doesn't have a text files", function() {
                           expect(this.dialog.$(".errors").text()).toContainTranslation("hdfs_instance.no_text_files")
                       })
                   });

               });

            });
        });
    });

    context("when csv_import:started event is triggered", function() {
        beforeEach(function() {
            spyOn(this.dialog, "closeModal")
            chorus.PageEvents.broadcast("csv_import:started");
        });
        it("closes the modal", function() {
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });
    });
});
