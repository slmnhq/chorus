describe("chorus.views.TabularDataSidebar", function() {
    beforeEach(function() {
        this.modalSpy = stubModals();
        this.view = new chorus.views.TabularDataSidebar();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        context("when it is disabled", function() {
            beforeEach(function() {
                this.view.disabled = true;
                spyOn(this.view, 'template');
                this.view.render();
            });

            it("does not actually render", function() {
                expect(this.view.template).not.toHaveBeenCalled();
            });
        });

        context("when no dataset is selected", function() {
            it("does not render the info section", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        });

        context("when a dataset is selected", function() {
            beforeEach(function() {
                this.server.reset();
                this.dataset = newFixtures.datasetSourceTable();
                chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
            });

            it("displays the selected dataset name", function() {
                expect(this.view.$(".name").text().trim()).toBe(this.dataset.get("objectName"));
            });

            it("displays the selected dataset type", function() {
                expect(this.view.$(".type").text().trim()).toBe(Handlebars.helpers.humanizedTabularDataType(this.dataset.attributes));
            });

            describe("activities", function() {
                it("fetches the activities for the dataset", function() {
                    expect(this.dataset.activities()).toHaveBeenFetched();
                });

                it("prefers only the without_workspace type for the activity list", function() {
                    expect(this.view.tabs.activity.options.displayStyle).toEqual(['without_workspace']);
                });

                context("when the activity fetch completes", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.dataset.activities());
                    });

                    it("renders an activity list inside the tabbed area", function() {
                        expect(this.view.tabs.activity).toBeA(chorus.views.ActivityList);
                        expect(this.view.tabs.activity.el).toBe(this.view.$(".tabbed_area .activity_list")[0]);
                    });
                });
            });

            describe("analyze table", function() {
                it("displays the analyze table action", function() {
                    expect(this.view.$(".actions a.analyze")).toContainTranslation("dataset.actions.analyze")
                });

                it("does not display for a view", function() {
                    this.dataset = fixtures.databaseView();
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    expect(this.view.$(".actions a.analyze")).not.toExist();
                });

                it("does not display the action for a external table", function() {
                    this.dataset = newFixtures.datasetExternalTable();
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    expect(this.view.$(".actions a.analyze")).not.toExist();
                });

                it("does not display the action for a external table", function() {
                    this.dataset = fixtures.datasetHadoopExternalTable();
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    expect(this.view.$(".actions a.analyze")).not.toExist();
                });

                context("when the run analyze link is clicked", function() {
                    beforeEach(function() {
                        this.view.$(".actions a.analyze").click();
                    });

                    it("displays an alert dialog", function() {
                        expect(this.modalSpy).toHaveModal(chorus.alerts.Analyze);
                    });
                });

                context("when the analyze:running event is broadcast", function() {
                    it("re-fetches the dataset statistics", function() {
                        this.server.reset();
                        chorus.PageEvents.broadcast("analyze:running");
                        expect(this.server.lastFetchFor(this.view.resource.statistics())).toBeDefined();
                    });
                });
            });

            context("when user does not have credentials", function() {
                beforeEach(function() {
                    this.dataset.set({hasCredentials: false});
                    this.view.render();
                });

                it("does not show the preview data link even when on a list page", function() {
                    this.view.options.listMode = true;
                    this.view.render();
                    expect(this.view.$('.actions .tabular_data_preview')).not.toExist();
                });

                it("does not have the 'Import Now' action even if there's a workspace", function() {
                    this.view.options.workspace = newFixtures.workspace();
                    this.view.render();
                    expect(this.view.$(".actions .import_now")).not.toExist();
                });

                it("does not show the analyze table action", function() {
                    expect(this.view.$(".actions a.analyze")).not.toExist();
                });

                it("shows a no-permissions message", function() {
                    this.view.render();
                    expect(this.view.$('.no_credentials')).toContainTranslation("dataset.credentials.missing.body", {linkText: t("dataset.credentials.missing.linkText")});
                });

                context("clicking on the link to add credentials", function() {
                    beforeEach(function() {
                        this.view.render();
                        this.view.$('.no_credentials a.add_credentials').click();
                    });

                    it("launches the InstanceAccount dialog", function() {
                        expect(chorus.modal).toBeA(chorus.dialogs.InstanceAccount);
                    });

                    context("saving the credentials", function() {
                        beforeEach(function() {
                            spyOn(chorus.router, "reload");
                            chorus.modal.$('input').val('stuff');
                            chorus.modal.$('form').submit();
                            this.server.completeSaveFor(chorus.modal.model);
                        });

                        it("reloads the current page", function() {
                            expect(chorus.router.reload).toHaveBeenCalled();
                        });
                    });
                });
            });

            context("when in list mode", function() {
                beforeEach(function() {
                    this.view.options.listMode = true;
                    this.view.render();
                });

                it("displays the 'Preview Data' link", function() {
                    expect(this.view.$('.actions .tabular_data_preview')).toContainTranslation('actions.tabular_data_preview');
                });

                describe("when the 'Preview Data' link is clicked", function() {
                    beforeEach(function() {
                        this.view.$(".tabular_data_preview").click();
                    });

                    it("displays the preview data dialog", function() {
                        expect(chorus.modal).toBeA(chorus.dialogs.TabularDataPreview);
                    });
                });
            });

            context("when not in list mode", function() {
                it("does not display the 'Preview Data' link", function() {
                    expect(this.view.$('.actions .tabular_data_preview')).not.toExist();
                });
            });

            context("when there is an archived workspace", function() {
                beforeEach(function() {
                    this.view.options.listMode = true;
                    this.view.options.workspace = newFixtures.workspace({active: false, state: 0, permission: ["update", "admin"]});
                    this.view.render();
                    this.dataset = newFixtures.datasetSourceTable();
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    this.server.completeFetchFor(this.view.importConfiguration, []);

                });

                it("has no action links except for 'Preview Data'", function() {
                    expect(this.view.$(".actions a").length).toBe(1);
                    expect(this.view.$(".actions a.tabular_data_preview")).toExist();
                });
            });

            context("when there is a workspace", function() {
                beforeEach(function() {
                    this.view.options.workspace = newFixtures.workspace();
                    this.view.render();
                });

                context("and no dataset is selected", function() {
                    beforeEach(function() {
                        chorus.PageEvents.broadcast("tabularData:selected");
                    });

                    itShowsTheAppropriateDeleteLink(false)
                    itDoesNotHaveACreateDatabaseViewLink();
                });

                it("doesn't display any import links by default", function() {
                    expect(this.view.$("a.create_schedule, a.edit_schedule, a.import_now")).not.toExist();
                });

                context("when the dataset is a sandbox table or view", function() {
                    beforeEach(function() {
                        this.dataset = newFixtures.datasetSandboxTable();
                        this.view.options.workspace = newFixtures.workspace({ permission: ["update"] })
                        chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    });

                    itDoesNotShowTheDuplicateChorusViewLink();
                    itShowsTheAppropriateDeleteLink(false);
                    itDoesNotHaveACreateDatabaseViewLink();

                    context("and the dataset has not received an import", function() {
                        beforeEach(function() {
                            this.server.completeFetchFor(this.view.importConfiguration, []);
                        });

                        it("doesn't display a 'import now' link", function() {
                            expect(this.view.$(".import_now")).not.toExist();
                        });
                    });

                    context("and the dataset has received an import from a dataset", function() {
                        beforeEach(function() {
                            this.server.completeFetchFor(this.dataset.getImport(), {
                                executionInfo: {
                                    startedStamp: "2012-02-29 14:35:38.100",
                                    completedStamp: "2012-02-29 14:35:38.165"
                                },
                                id: "123",
                                sourceId: '"10032"|"dca_demo"|"ddemo"|"BASE_TABLE"|"a2"',
                                sourceTable: "some_source_table"
                            });
                        });

                        it("has an 'imported xx ago' description", function() {
                            var sourceTable = new chorus.models.Dataset({
                                id: '"10032"|"dca_demo"|"ddemo"|"BASE_TABLE"|"a2"',
                                workspaceId: this.dataset.get("workspace").id
                            });
                            expect(this.view.$(".last_import")).toContainTranslation("import.last_imported_into", {
                                timeAgo: chorus.helpers.relativeTimestamp("2012-02-29 14:35:38.165"),
                                tableLink: "some_source_..."
                            });
                            expect(this.view.$(".last_import a")).toHaveHref(sourceTable.showUrl())
                        });

                        it("doesn't display a 'import now' link", function() {
                            expect(this.view.$(".import_now")).not.toExist();
                        });
                    });

                    context("and the dataset has received an import from a file", function() {
                        beforeEach(function() {
                            this.server.completeFetchFor(this.dataset.getImport(), {
                                executionInfo: {
                                    startedStamp: "2012-02-29 14:35:38.100",
                                    completedStamp: "2012-02-29 14:35:38.165"
                                },
                                id: "123",
                                sourceId: '"10032"|"dca_demo"|"ddemo"|"BASE_TABLE"|"a2"',
                                sourceTable: "some_source_file.csv",
                                sourceType: "upload_file"
                            });
                        });

                        it("has an 'imported xx ago' description", function() {
                            var sourceTable = new chorus.models.Dataset({
                                id: '"10032"|"dca_demo"|"ddemo"|"BASE_TABLE"|"a2"',
                                workspaceId: this.dataset.get("workspace").id
                            });
                            expect(this.view.$(".last_import")).toContainTranslation("import.last_imported_into", {
                                timeAgo: chorus.helpers.relativeTimestamp("2012-02-29 14:35:38.165"),
                                tableLink: "some_source_..."
                            });
                        });

                        it("renders the filename as a span with a title", function() {
                            expect(this.view.$(".last_import a")).not.toExist();
                            expect(this.view.$(".last_import .source_file")).toBe("span");
                            expect(this.view.$(".last_import .source_file")).toHaveText("some_source_...");
                            expect(this.view.$(".last_import .source_file")).toHaveAttr("title", "some_source_file.csv")
                        });

                        it("doesn't display a 'import now' link", function() {
                            expect(this.view.$(".import_now")).not.toExist();
                        });
                    });
                });

                context("when the dataset is the source of this import", function() {
                    beforeEach(function() {
                        chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    });

                    itShowsTheAppropriateDeleteLink(true, "table");
                    itDoesNotHaveACreateDatabaseViewLink();

                    it("fetches the import configuration for the dataset", function() {
                        expect(this.dataset.getImport()).toHaveBeenFetched();
                    });

                    describe("when the import fetch completes", function() {
                        context("and the dataset has no import information", function() {
                            beforeEach(function() {
                                this.server.completeFetchFor(this.view.importConfiguration, []);
                            });

                            context("and the current user has update permissions on the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = newFixtures.workspace({ permission: ["update"] })
                                    this.view.render();
                                });

                                context("and the workspace has a sandbox", function() {
                                    it("shows the 'import now' link", function() {
                                        expect(this.view.$("a.import_now")).toExist();
                                    });

                                    it("has a 'create import schedule' link", function() {
                                        var createScheduleLink = this.view.$("a.create_schedule");
                                        expect(createScheduleLink.text()).toMatchTranslation("actions.create_schedule");
                                    });

                                    it("should have the dataset attached as data-dataset", function() {
                                        expect(this.view.$("a.create_schedule[data-dialog=ImportScheduler]").data("dataset")).toBe(this.dataset);
                                    });

                                    it("should have the workspace attached as data-workspace", function() {
                                        expect(this.view.$("a.create_schedule[data-dialog=ImportScheduler]").data("workspace")).toBe(this.view.options.workspace);
                                    });
                                });

                                context("and the workspace does not have a sandbox", function() {
                                    beforeEach(function() {
                                        delete this.view.options.workspace._sandbox;
                                        this.view.options.workspace.set({
                                            "sandboxInfo": {
                                                databaseId: null,
                                                databaseName: null,
                                                instanceId: null,
                                                instanceName: null,
                                                sandboxId: null,
                                                schemaId: null,
                                                schemaName: null
                                            }
                                        })
                                        this.view.render();
                                    });

                                    it("disables the 'import now' link", function() {
                                        expect(this.view.$("a.import_now")).not.toExist();
                                        expect(this.view.$("span.import_now")).toHaveClass('disabled');
                                    });

                                    it("disables 'create import schedule' link", function() {
                                        expect(this.view.$("a.create_schedule")).not.toExist();
                                        expect(this.view.$("span.create_schedule")).toHaveClass('disabled');
                                    });
                                });
                            });

                            context("and the current user does not have update permissions on the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = newFixtures.workspace({ permission: ["read"] })
                                    this.view.render();
                                });

                                it("does not have a 'create import schedule' link", function() {
                                    expect(this.view.$("a.create_schedule")).not.toExist();
                                });

                                it("does not have an 'import now' link", function() {
                                    expect(this.view.$("a.import_now.dialog")).not.toExist();
                                });
                            });

                            it("doesn't have an 'edit import schedule' link'", function() {
                                expect(this.view.$("a.edit_schedule")).not.toExist();
                            });
                        });

                        context("when the dataset has an import schedule", function() {
                            beforeEach(function() {
                                this.importResponse = fixtures.datasetImport({
                                    sourceId: this.dataset.id,
                                    executionInfo: {},
                                    scheduleInfo: {
                                        endTime: "2013-06-02",
                                        frequency: "WEEKLY",
                                        jobName: "ScheduleJob_1330719934443",
                                        startTime: "2012-02-29 14:23:58.169"
                                    },
                                    workspaceId: this.dataset.workspace().id,
                                    toTable: "our_destination",
                                    destinationTable: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"our_destination"'
                                });
                                this.view.options.workspace = newFixtures.workspace({ permission: ["update"] })
                            });

                            it("shows the next import time", function() {
                                this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                expect(this.view.$(".next_import").text()).toContainTranslation("import.next_import", {
                                    nextTime: "in 1 year",
                                    tableLink: "our_destinat..."
                                });
                                expect(this.view.$(".next_import a")).toContainText("our_destinat...");

                                var destTable = new chorus.models.Dataset({
                                    id: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"our_destination"',
                                    workspaceId: this.dataset.get("workspace").id
                                });
                                expect(this.view.$(".next_import a")).toHaveHref(destTable.showUrl());
                            });

                            context("when the import has been successfully executed", function() {
                                beforeEach(function() {
                                    this.importResponse.set({
                                        executionInfo: {
                                            startedStamp: "2012-02-29 14:23:58.169",
                                            completedStamp: "2012-02-29 14:23:59.027",
                                            result: {
                                                executeResult: "success"
                                            },
                                            state: "success",
                                            toTable: 'our_destination',
                                            toTableId: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"our_destination"',
                                            creator: "InitialUser"
                                        }
                                    });

                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "edit_schedule"]);

                                it("has an 'imported xx ago' description", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo")
                                    var destTable = new chorus.models.Dataset({
                                        id: execInfo.toTableId,
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_imported", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "our_destinat..."})
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                });
                            });

                            context("when the import is in progress", function() {
                                beforeEach(function() {
                                    this.importResponse.set({
                                        executionInfo: {
                                            startedStamp: "2012-02-29 14:23:58.169",
                                            toTable: 'our_destination_plus_some_more',
                                            toTableId: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"our_destination_plus_some_more"',
                                            creator: "InitialUser",
                                            state: "success"
                                        }
                                    })

                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "edit_schedule"]);

                                it("has an 'import in progress' description", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo")
                                    var destTable = new chorus.models.Dataset({
                                        id: execInfo.toTableId,
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.in_progress", {tableLink: "our_destinat..."});
                                    expect(this.view.$(".last_import")).toContainTranslation("import.began", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.startedStamp)});
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl());
                                    expect(this.view.$(".last_import img").attr("src")).toBe("/images/in_progress.png");
                                });
                            });

                            context("when the import has failed to execute", function() {
                                beforeEach(function() {
                                    this.importResponse.set({
                                        executionInfo: {
                                            toTable: "bad_destination_table",
                                            toTableId: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"bad_destination_table"',
                                            startedStamp: "2012-02-29 14:23:58.169",
                                            completedStamp: "2012-02-29 14:23:59.027",
                                            result: {
                                                executeResult: "failed"
                                            },
                                            state: "failed",
                                            creator: "InitialUser"
                                        }
                                    })

                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                it("has an 'import failed xx ago' description", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo")
                                    var destTable = new chorus.models.Dataset({
                                        id: execInfo.toTableId,
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_import_failed", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "bad_destinat..."})
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                    expect(this.view.$(".last_import img").attr("src")).toBe("/images/message_error_small.png");
                                });

                                itHasActionLinks(["import_now", "edit_schedule"]);
                            });

                            context("when the import has not yet executed", function() {
                                beforeEach(function() {
                                    this.importResponse.set({executionInfo: {} });
                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "edit_schedule"]);
                            });
                        });

                        context("when the dataset does not have an import schedule", function() {
                            beforeEach(function() {
                                this.importResponse = new chorus.models.DatasetImport({
                                    datasetId: this.dataset.get("id"),
                                    workspaceId: this.dataset.workspace().id
                                });
                                this.view.options.workspace = newFixtures.workspace({ permission: ["update"] })
                            });

                            context("when the import has been successfully executed", function() {
                                beforeEach(function() {
                                    this.importResponse.set({
                                        executionInfo: {
                                            startedStamp: "2012-02-29 14:23:58.169",
                                            completedStamp: "2012-02-29 14:23:59.027",
                                            result: {
                                                executeResult: "success"
                                            },
                                            toTable: 'our_destination',
                                            toTableId: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"our_destination"',
                                            state: "success",
                                            creator: "InitialUser"
                                        }
                                    })
                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "create_schedule"]);

                                it("has an 'imported xx ago' description", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo")
                                    var destTable = new chorus.models.Dataset({
                                        id: execInfo.toTableId,
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_imported", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "our_destinat..."})
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                });
                            });

                            context("when the import has failed to execute", function() {
                                beforeEach(function() {
                                    this.importResponse.set({
                                        executionInfo: {
                                            startedStamp: "2012-02-29 14:23:58.169",
                                            completedStamp: "2012-02-29 14:23:59.027",
                                            result: {
                                                executeResult: "failed"
                                            },
                                            state: "failed",
                                            toTable: 'our_destination',
                                            toTableId: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"our_destination"',
                                            creator: "InitialUser"
                                        }
                                    })

                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "create_schedule"]);

                                it("has an 'import failed xx ago' description", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo")
                                    var destTable = new chorus.models.Dataset({
                                        id: execInfo.toTableId,
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_import_failed", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "our_destinat..."})
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                    expect(this.view.$(".last_import img").attr("src")).toBe("/images/message_error_small.png");
                                });
                            });

                            context("when an Import Now is in progress", function() {
                                beforeEach(function() {
                                    this.importResponse.set({executionInfo: {
                                        startedStamp: "2012-02-29 14:23:58.169",
                                        toTable: "our_destination",
                                        toTableId: '"10000"|"Analytics"|"analytics"|"BASE_TABLE"|"bad_destination_table"'
                                    }});

                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                it("says the import is in progress", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo");
                                    var destTable = new chorus.models.Dataset({ id: execInfo.toTableId, workspaceId: this.dataset.get("workspace").id});

                                    expect(this.view.$(".last_import")).toContainTranslation("import.in_progress", {tableLink: "our_destinat..."});
                                    expect(this.view.$(".last_import")).toContainTranslation("import.began", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.startedStamp), tableLink: "our_destination..."});
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                    expect(this.view.$(".last_import img").attr("src")).toBe("/images/in_progress.png");
                                });

                                itHasActionLinks(["import_now", "create_schedule"]);
                            });

                            context("when the import has not yet executed", function() {
                                beforeEach(function() {
                                    this.importResponse.set({ executionInfo: {} });
                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "create_schedule"]);
                            });
                        });

                        function itHasActionLinks(linkClasses) {
                            var possibleLinkClasses = ["import_now", "edit_schedule", "create_schedule"];

                            context("when the user has permission to update in the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = newFixtures.workspace({ permission: ["update"] })
                                    this.view.render();
                                });

                                _.each(linkClasses, function(linkClass) {
                                    it("has a '" + linkClass + "' link, which opens the import scheduler dialog", function() {
                                        var link = this.view.$("a." + linkClass)
                                        expect(link).toExist();
                                        expect(link.text()).toMatchTranslation("actions." + linkClass);
                                        expect(link.data("dialog")).toBe("ImportScheduler");
                                    });

                                    it("attaches the dataset to the '" + linkClass + "' link", function() {
                                        var link = this.view.$("a." + linkClass)
                                        expect(link.data("dataset")).toBe(this.dataset);
                                    });
                                });

                                _.each(_.difference(possibleLinkClasses, linkClasses), function(linkClass) {
                                    it("does not have a '" + linkClass + "' link", function() {
                                        expect(this.view.$("a." + linkClass)).not.toExist();
                                    });
                                });
                            });

                            context("when the user does not have permission to update things in the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = newFixtures.workspace({ permission: ["read"] })
                                    this.view.render();
                                });

                                _.each(possibleLinkClasses, function(linkClass) {
                                    it("does not have a '" + linkClass + "' link", function() {
                                        expect(this.view.$("a." + linkClass)).not.toExist();
                                    });
                                });
                            });
                        }
                    });
                });

                context("when the dataset is a source view", function() {
                    beforeEach(function() {
                        this.dataset = newFixtures.datasetSourceView();
                        chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    });

                    itDoesNotShowTheDuplicateChorusViewLink();
                    itShowsTheAppropriateDeleteLink(true, "view");
                    itDoesNotHaveACreateDatabaseViewLink();
                });

                context("when the dataset is a chorus view", function() {
                    beforeEach(function() {
                        this.dataset = newFixtures.datasetChorusView({ objectName: "annes_table", query: "select * from foos;" });
                        chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    });

                    itShowsTheAppropriateDeleteLink(true, "chorus view");

                    it("shows the 'duplicate' link'", function() {
                        expect(this.view.$("a.duplicate").text()).toMatchTranslation("dataset.chorusview.duplicate");
                    });

                    describe("clicking the 'duplicate' link", function() {
                        beforeEach(function() {
                            this.modalSpy.reset();
                            this.view.$("a.duplicate").click();
                        });

                        it("launches the name chorus view dialog", function() {
                            expect(this.modalSpy).toHaveModal(chorus.dialogs.VerifyChorusView);
                        });

                        it("passes the dialog a duplicate of the chorus view", function() {
                            expect(this.modalSpy.lastModal().model.attributes).toEqual(this.dataset.createDuplicateChorusView().attributes);
                        });
                    });

                    it("shows the 'Create as a database view' link", function() {
                        expect(this.view.$("a.create_database_view[data-dialog=CreateDatabaseView]")).toContainTranslation("actions.create_database_view");
                    });
                });

                context("when the dataset is a source table", function() {
                    _.each(["BASE_TABLE", "EXTERNAL_TABLE", "MASTER_TABLE", "HDFS_EXTERNAL_TABLE"], function(type) {
                        beforeEach(function() {
                            this.dataset = newFixtures.datasetSourceTable({ objectType : type});
                            chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                        });

                        itShowsTheAppropriateDeleteLink(true, type);
                        itDoesNotHaveACreateDatabaseViewLink();
                        itDoesNotShowTheDuplicateChorusViewLink();
                    })
                })

                it("has an associate with another workspace link", function() {
                    expect(this.view.$('.actions .associate')).toContainTranslation("actions.associate_with_another_workspace");
                    this.view.$('.actions .associate').click();
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.AssociateWithWorkspace);
                });

                it("has the 'add a note' link with the correct data", function() {
                    var notesNew = this.view.$("a.dialog[data-dialog=NotesNew]");

                    expect(notesNew.data("entity-id") + "").toBe(this.dataset.get("id"));
                    expect(notesNew.data("entity-type")).toBe(this.dataset.entityType);
                    expect(notesNew.data("display-entity-type")).toBe(this.dataset.metaType());
                    expect(notesNew.attr("data-allow-workspace-attachments")).toBeDefined();
                });

                function itDoesNotHaveACreateDatabaseViewLink() {
                    it("does not have a create database view link", function() {
                        expect(this.view.$("a.create_database_view")).not.toExist();
                    });
                }

                function itShowsTheAppropriateDeleteLink(shouldBePresent, type) {
                    if (shouldBePresent) {
                        var keyPrefix, textKey;

                        if (type == "chorus view") {
                            keyPrefix = "delete";
                            textKey = "actions.delete";
                        } else if (type == "view") {
                            keyPrefix = "disassociate_view";
                            textKey = "actions.delete_association";
                        } else {
                            keyPrefix = "disassociate_table";
                            textKey = "actions.delete_association";
                        }

                        context("and the logged-in user has update permission on the workspace", function() {
                            beforeEach(function() {
                                this.view.options.workspace = newFixtures.workspace({ permission: ["update"] });
                                this.view.render();
                            });

                            it("displays a delete link", function() {
                                var el = this.view.$("a.alert[data-alert=DatasetDelete][data-key-prefix=" + keyPrefix + "]");
                                expect(el).toExist();
                                expect(el).toHaveText(t(textKey))
                            });
                        });

                        context("and the logged-in user does not have update permission on the workspace", function() {
                            beforeEach(function() {
                                this.view.options.workspace = newFixtures.workspace({ permission: ["read"] });
                                this.view.render();
                            });

                            it("does not display a delete link", function() {
                                expect(this.view.$("a.alert[data-alert=DatasetDelete]")).not.toExist();
                            });
                        });
                    } else {
                        it("does not display a delete link", function() {
                            this.view.render();
                            expect(this.view.$("a.alert[data-alert=DatasetDelete]")).not.toExist();
                        });
                    };
                };

                function itDoesNotShowTheDuplicateChorusViewLink() {
                    it("does not show the 'duplicate' link", function() {
                        expect(this.view.$("a.duplicate")).not.toExist();
                    });
                }
            });

            context("when there is not a workspace", function() {
                beforeEach(function() {
                    this.dataset = fixtures.databaseTable({id: "XYZ"});
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                });

                it("has the 'add a note' link with the correct data", function() {
                    var notesNew = this.view.$("a.dialog[data-dialog=NotesNew]");
                    expect(notesNew.data("entity-id")).toBe(this.dataset.get("id"));
                    expect(notesNew.data("entity-type")).toBe("databaseObject");
                    expect(notesNew.data("display-entity-type")).toBe(this.dataset.metaType());
                    expect(notesNew.attr("data-allow-workspace-attachments")).not.toBeDefined();
                });

                it("does not have the 'Import Now' action", function() {
                    expect(this.view.$(".actions .import_now")).not.toExist();
                });

                it("does not display a delete link", function() {
                    spyOn(this.view.resource, 'isDeleteable').andReturn(true);
                    this.view.render();
                    expect(this.view.$("a.alert[data-alert=DatasetDelete]")).not.toExist();
                });

                it("has a link to associate the dataset with a workspace", function() {
                    expect(this.view.$('.actions .associate')).toContainTranslation('actions.associate_with_workspace');
                });

                describe("when the 'associate with workspace' link is clicked", function() {
                    beforeEach(function() {
                        this.view.$("a.associate").click();
                    });

                    it("displays the associate with workspace dialog", function() {
                        expect(chorus.modal).toBeA(chorus.dialogs.AssociateWithWorkspace);
                    });

                    it("lists only active workspaces", function() {
                        expect(chorus.modal.options.activeOnly).toBeTruthy();
                    });

                    describe("when the dialog successfully associates", function() {
                        beforeEach(function() {
                            this.server.reset();
                            chorus.PageEvents.broadcast("workspace:associated");
                        });

                        it("re-fetches the resource", function() {
                            expect(this.view.resource).toHaveBeenFetched();
                        });
                    });
                });
            });
        });

        describe("column statistics", function() {
            beforeEach(function() {
                this.dataset = newFixtures.datasetSourceTable();
                this.column = fixtures.databaseColumn({
                    avg: 719719.111,
                    commonValues: [46, 38],
                    distinctValue: 998710,
                    max: "1199961.0",
                    median: "725197.0",
                    min: "200075.0",
                    nullFraction: 10.3678,
                    stdDeviation: 309104.997,
                    type: "int8",
                    typeCategory: "WHOLE_NUMBER"
                });

                chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                this.view.resource.statistics().set({lastAnalyzedTime: "2012-01-24 12:25:11.077"});
                chorus.PageEvents.broadcast("column:selected", this.column);
                this.view.render();
            });

            describe("statistics labels", function() {
                it("should display the column name", function() {
                    expect(this.view.$(".column_title .title").text()).toContainTranslation("dataset.column_name");
                    expect(this.view.$(".column_title .column_name").text()).toBe(this.column.get("name"));
                });

                it("should display the column labels in the correct order", function() {
                    expect(this.view.$(".column_statistics .pair").eq(0).find(".key")).toContainTranslation("dataset.column_statistics.type_category");
                    expect(this.view.$(".column_statistics .pair").eq(1).find(".key")).toContainTranslation("dataset.column_statistics.type");
                    expect(this.view.$(".column_statistics .pair").eq(2).find(".key")).toContainTranslation("dataset.column_statistics.min");
                    expect(this.view.$(".column_statistics .pair").eq(3).find(".key")).toContainTranslation("dataset.column_statistics.median");
                    expect(this.view.$(".column_statistics .pair").eq(4).find(".key")).toContainTranslation("dataset.column_statistics.avg");
                    expect(this.view.$(".column_statistics .pair").eq(5).find(".key")).toContainTranslation("dataset.column_statistics.max");
                    expect(this.view.$(".column_statistics .pair").eq(6).find(".key")).toContainTranslation("dataset.column_statistics.stddev");
                    expect(this.view.$(".column_statistics .pair").eq(7).find(".key")).toContainTranslation("dataset.column_statistics.distinct");
                    expect(this.view.$(".column_statistics .pair").eq(8).find(".key")).toContainTranslation("dataset.column_statistics.pctnull");

                    expect(this.view.$(".column_statistics .multiline").eq(0).find(".key")).toContainTranslation("dataset.column_statistics.common");
                });
            });

            describe("statistics values", function() {
                context("when the dataset has never been analyzed", function() {
                    beforeEach(function() {
                        this.view.resource.statistics().set({
                            lastAnalyzedTime: null
                        });
                        this.column.set({
                            typeCategory: "WHOLE_NUMBER",
                            type: "int8",
                            max: "1199961.0",
                            median: "725197.0",
                            min: "200075.0"
                        });
                        this.view.render();
                    });

                    it("should only display the typeCategory and type", function() {
                        expect(this.view.$(".column_statistics .pair").length).toBe(2);
                        expect(this.view.$(".column_statistics .type_category .value")).toExist();
                        expect(this.view.$(".column_statistics .type .value")).toExist();
                    });
                });

                context("when statistics are available", function() {
                    it("should display the statistics", function() {
                        expect(this.view.$(".column_statistics .type_category .value").text()).toBe(this.column.get("typeClass"));
                        expect(this.view.$(".column_statistics .type .value").text()).toBe("int8");
                        expect(this.view.$(".column_statistics .min .value").text()).toBe("200075");
                        expect(this.view.$(".column_statistics .median .value").text()).toBe("725197");
                        expect(this.view.$(".column_statistics .avg .value").text()).toBe("719719.11");
                        expect(this.view.$(".column_statistics .max .value").text()).toBe("1199961");
                        expect(this.view.$(".column_statistics .stddev .value").text()).toBe("309105");
                        expect(this.view.$(".column_statistics .distinct .value").text()).toBe("998710");
                        expect(this.view.$(".column_statistics .pctnull .value").text()).toBe("10.37%");

                        expect(this.view.$(".column_statistics .common .value").eq(0).text()).toBe("46");
                        expect(this.view.$(".column_statistics .common .value").eq(1).text()).toBe("38");
                    });
                });

                context("when the min is not available", function() {
                    it("should not display the min", function() {
                        this.column.set({min: null});
                        this.view.render();
                        expect(this.view.$(".column_statistics .min")).not.toExist();
                    });
                });

                context("when the median is not available", function() {
                    it("should not display the median", function() {
                        this.column.set({median: null});
                        this.view.render();
                        expect(this.view.$(".column_statistics .median")).not.toExist();
                    });
                });

                context("when the avg is not available", function() {
                    it("should not display the avg", function() {
                        this.column.set({avg: null});
                        this.view.render();
                        expect(this.view.$(".column_statistics .avg")).not.toExist();
                    });
                });

                context("when the max is not available", function() {
                    it("should not display the max", function() {
                        this.column.set({max: null});
                        this.view.render();
                        expect(this.view.$(".column_statistics .max")).not.toExist();
                    });
                });

                context("when the stdDeviation is not available", function() {
                    it("should not display the stdDeviation", function() {
                        this.column.set({stdDeviation: null});
                        this.view.render();
                        expect(this.view.$(".column_statistics .stdDeviation")).not.toExist();
                    });
                });

                context("when the distinctValue is not available", function() {
                    it("should not display the distinctValue", function() {
                        this.column.set({distinctValue: null});
                        this.view.render();
                        expect(this.view.$(".column_statistics .distinctValue")).not.toExist();
                    });
                });

                context("when the commonValues is not available", function() {
                    it("should not display the commonValues", function() {
                        this.column.set({commonValues: []});
                        this.view.render();
                        expect(this.view.$(".column_statistics .commonValues")).not.toExist();
                    });
                });

                context("when the nullFraction is not available", function() {
                    it("should not display the nullFraction", function() {
                        this.column.set({nullFraction: null});
                        this.view.render();
                        expect(this.view.$(".column_statistics .nullFraction")).not.toExist();
                    });
                });
            });
        });

        describe("when importSchedule:changed is triggered", function() {
            beforeEach(function() {
                this.newImport = fixtures.datasetImport();
                spyOn(this.view, 'render').andCallThrough();
                chorus.PageEvents.broadcast("importSchedule:changed", this.newImport);
            })
            it("updates the importConfiguration and renders", function() {
                expect(this.view.importConfiguration).toBe(this.newImport);
                expect(this.view.render).toHaveBeenCalled();
            })
        })

        describe("has all the translations for all objectTypes", function() {
            _.each(["QUERY", "VIEW", "TABLE", "BASE_TABLE", "HDFS_EXTERNAL_TABLE", "EXTERNAL_TABLE"], function(type) {
                it("does not have any missing translations for" + type, function() {
                    this.dataset = newFixtures.datasetSourceTable({objectType: type});
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    expect(this.view.tabs.activity.options.type).not.toContain("missing");
                })
            }, this)
        })

        describe("event handing", function() {
            describe("start:visualization", function() {
                beforeEach(function() {
                    expect($(this.view.el)).not.toHaveClass("visualizing");
                    chorus.PageEvents.broadcast("start:visualization");
                });

                it("adds the 'visualizing' class to sidebar_content", function() {
                    expect($(this.view.el)).toHaveClass("visualizing");
                });
            });
            describe("cancel:visualization", function() {
                beforeEach(function() {
                    chorus.PageEvents.broadcast("start:visualization")
                    expect($(this.view.el)).toHaveClass("visualizing")
                    chorus.PageEvents.broadcast("cancel:visualization")
                });

                it("removes the 'visualizing' class from sidebar_content", function() {
                    expect($(this.view.el)).not.toHaveClass("visualizing")
                });
            });
        });
    });
});
