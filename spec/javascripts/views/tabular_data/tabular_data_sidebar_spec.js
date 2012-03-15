describe("chorus.views.TabularDataSidebar", function() {
    beforeEach(function() {
        stubModals();
        this.view = new chorus.views.TabularDataSidebar();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        context("when it is disabled", function() {
            beforeEach(function() {
                this.view.disabled = true;
                spyOn(this.view, 'template')
                this.view.render();
            });

            it("does not actually render", function() {
                expect(this.view.template).not.toHaveBeenCalled();
            })
        });

        context("when no dataset is selected", function() {
            it("does not render the info section", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        })

        context("when a dataset is selected", function() {
            beforeEach(function() {
                this.server.reset();
                this.dataset = fixtures.datasetSourceTable();
                chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
            });

            it("displays the selected dataset name", function() {
                expect(this.view.$(".name").text().trim()).toBe(this.dataset.get("objectName"))
            });

            it("displays the selected dataset type", function() {
                expect(this.view.$(".type").text().trim()).toBe(Handlebars.helpers.humanizedTabularDataType(this.dataset.attributes))
            });

            describe("statistics", function() {

                it("fetches the statistics for the dataset", function() {
                    expect(this.dataset.statistics()).toHaveBeenFetched()
                });

                context("when the statistics arrive", function() {
                    beforeEach(function() {
                        this.stats = this.dataset.statistics();
                        this.stats.set({
                            rows: 0,
                            columns: 0,
                            lastAnalyzedTime: "2011-12-12 12:34:56",
                            onDiskSize: "1 GB",
                            desc: "foo",
                            partitions: 2
                        });
                        this.server.completeFetchFor(this.stats);
                    });

                    it("displays rows when the value is 0", function() {
                        expect(this.view.$(".statistics .rows .value").text().trim()).toBe("0")
                    });

                    it("displays columns when the value is 0", function() {
                        expect(this.view.$(".statistics .columns .value").text().trim()).toBe("0")
                    });

                    it("displays the on disk size", function() {
                        expect(this.view.$(".size .value").text().trim()).toBe("1 GB");
                    });

                    it("displays the description", function() {
                        expect(this.view.$(".description p").text().trim()).toBe("foo");
                    });

                    it("displays the last analyzed time", function() {
                        expect(this.view.$(".last_analyzed_time .value").text()).toBe(chorus.helpers.relativeTimestamp(this.stats.get("lastAnalyzedTime")));
                    });

                    it("displays the partitions", function() {
                        expect(this.view.$(".partitions .value").text()).toBe("2")
                    })

                    it("displays the statistics in the correct order", function() {
                        expect(this.view.$(".statistics .pair").eq(0).find(".key").text().trim()).toMatchTranslation("dataset.statistics.type");
                        expect(this.view.$(".statistics .pair").eq(1).find(".key").text().trim()).toMatchTranslation("dataset.statistics.partitions");
                        expect(this.view.$(".statistics .pair").eq(2).find(".key").text().trim()).toMatchTranslation("dataset.statistics.columns");
                        expect(this.view.$(".statistics .pair").eq(3).find(".key").text().trim()).toMatchTranslation("dataset.statistics.last_analyzed_time");
                        expect(this.view.$(".statistics .pair").eq(4).find(".key").text().trim()).toMatchTranslation("dataset.statistics.rows");
                        expect(this.view.$(".statistics .pair").eq(5).find(".key").text().trim()).toMatchTranslation("dataset.statistics.size");
                    });

                    describe("when the partitions are 0", function() {
                        beforeEach(function() {
                            this.view = new chorus.views.TabularDataSidebar();
                            this.view.setTabularData(this.dataset);
                            this.stats.set({ partitions: 0 });
                            this.view.render();
                        });

                        it("should not show the partitions pair", function() {
                            expect(this.view.$(".partitions")).not.toExist()
                        })
                    })

                    describe("when the lastAnalyzedTime is null", function() {
                        beforeEach(function() {
                            this.view = new chorus.views.TabularDataSidebar();
                            this.view.setTabularData(this.dataset)
                            this.stats.set({ lastAnalyzedTime: null, rows: 5837 });
                            this.view.render();
                        })

                        it("should not display the lastAnalyzedTime or row count", function() {
                            expect(this.view.$(".rows")).not.toExist();
                            expect(this.view.$(".last_analyzed_time")).not.toExist();
                        });
                    });
                });

            });

            describe("activities", function() {
                it("fetches the activities for the dataset", function() {
                    expect(this.dataset.activities()).toHaveBeenFetched()
                });

                it("prefers only the without_workspace type for the activity list", function() {
                    expect(this.view.activityList.options.displayStyle).toEqual(['without_workspace']);
                });

                context("when the activity fetch completes", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.dataset.activities());
                    });

                    it("renders an activity list inside the tabbed area", function() {
                        expect(this.view.activityList).toBeA(chorus.views.ActivityList);
                        expect(this.view.activityList.el).toBe(this.view.$(".tabbed_area .activity_list")[0]);
                    });
                });
            });

            context("when user does not have credentials", function() {
                beforeEach(function() {
                    this.dataset.set({hasCredentials: false})
                });

                it("does not show the preview data link even when on a list page", function() {
                    this.view.options.listMode = true;
                    this.view.render();
                    expect(this.view.$('.actions .tabular_data_preview')).not.toExist();
                });

                it("does not have the 'Import Now' action even if there's a workspace", function() {
                    this.view.options.workspace = fixtures.workspace();
                    this.view.render();
                    expect(this.view.$(".actions .import_now")).not.toExist();
                });

                it("shows a no-permissions message", function() {
                    this.view.render();
                    expect(this.view.$('.no_credentials')).toContainTranslation("dataset.credentials.missing.body", {linkText: t("dataset.credentials.missing.linkText")});
                });

                context("clicking on the link to add credentials", function() {
                    beforeEach(function() {
                        this.view.render();
                        this.view.$('.no_credentials a.add_credentials').click();
                    })

                    it("launches the InstanceAccount dialog", function() {
                        expect(chorus.modal).toBeA(chorus.dialogs.InstanceAccount);
                    });

                    context("saving the credentials", function() {
                        beforeEach(function() {
                            spyOn(chorus.router, "reload");
                            chorus.modal.$('input').val('stuff');
                            chorus.modal.$('form').submit();
                            this.server.completeSaveFor(chorus.modal.model);
                        })

                        it("reloads the current page", function() {
                            expect(chorus.router.reload).toHaveBeenCalled();
                        })
                    })
                })
            })

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

            context("when there is a workspace", function() {
                beforeEach(function() {
                    this.view.options.workspace = fixtures.workspace();
                    this.view.render();
                });

                it("doesn't display any import links by default", function() {
                    expect(this.view.$("a.create_schedule, a.edit_schedule, a.import_now")).not.toExist();
                });

                context("when the dataset is a sandbox table or view", function() {
                    context("and the dataset has received an import", function() {
                        beforeEach(function() {
                            this.dataset = fixtures.datasetSandboxTable({
                                importInfo: {
                                    completedStamp: "2012-02-29 14:35:38.165",
                                    sourceId: "10032|dca_demo|ddemo|BASE_TABLE|a2",
                                    sourceTable: "some_source_table"
                                }
                            });
                            chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                        });

                        it("has an 'imported xx ago' description", function() {
                            var sourceTable = new chorus.models.Dataset({
                                id: "10032|dca_demo|ddemo|BASE_TABLE|a2",
                                workspaceId: this.dataset.get("workspace").id
                            });
                            expect(this.view.$(".last_import")).toContainTranslation("import.last_imported_into", {
                                timeAgo: chorus.helpers.relativeTimestamp("2012-02-29 14:35:38.165"),
                                tableLink: "some_source_table"
                            });
                            expect(this.view.$(".last_import a")).toHaveHref(sourceTable.showUrl())
                        });

                        it("doesn't fetch the import configuration", function() {
                            expect(this.dataset.getImport()).not.toHaveBeenFetched();
                        });

                        it("doesn't display a 'import now' link", function() {
                            expect(this.view.$(".import_now")).not.toExist();
                        });
                    });

                    context("and the dataset has not received an import", function() {
                        beforeEach(function() {
                            this.dataset = fixtures.datasetSandboxTable({ importInfo: null });
                            chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                        });

                        it("doesn't fetch the import configuration", function() {
                            expect(this.dataset.getImport()).not.toHaveBeenFetched();
                        });

                        it("doesn't display a 'import now' link", function() {
                            expect(this.view.$(".import_now")).not.toExist();
                        });
                    });
                });

                context("when the dataset is a source table or view", function() {
                    beforeEach(function() {
                        this.dataset = fixtures.datasetSourceTable();
                        chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    });

                    it("fetches the import configuration for the dataset", function() {
                        expect(this.dataset.getImport()).toHaveBeenFetched();
                    });

                    describe("when a non-importable dataset is then selected", function() {
                        beforeEach(function() {
                            this.dataset = fixtures.datasetSandboxTable();
                            chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                        });

                        it("does not show the 'import now' link", function() {
                            expect(this.view.$("a.import_now")).not.toExist();
                        });

                        it("does not try to fetch the import configuration", function() {
                            expect(this.dataset.getImport()).not.toHaveBeenFetched();
                        });
                    });

                    describe("when the import fetch completes", function() {
                        context("and the dataset has no import information", function() {
                            beforeEach(function() {
                                this.server.completeFetchFor(this.view.importConfiguration, []);
                            });

                            context("and the current user has update permissions on the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = fixtures.workspace({ permission: ["update"] })
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
                                    this.view.options.workspace = fixtures.workspace({ permission: ["read"] })
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
                                    scheduleInfo: {
                                        endTime: "2013-06-02",
                                        frequency: "WEEKLY",
                                        jobName: "ScheduleJob_1330719934443",
                                        startTime: "2012-02-29 14:23:58.169"
                                    },
                                    toTable: "our_destination",
                                    destinationTable: "10000|Analytics|analytics|BASE_TABLE|our_destination"
                                });
                                this.view.options.workspace = fixtures.workspace({ permission: ["update"] })
                            });

                            it("shows the next import time", function() {
                                this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                expect(this.view.$(".next_import").text()).toContainTranslation("import.next_import", {
                                    nextTime: "in 1 year",
                                    tableLink: "our_destination"
                                });
                                expect(this.view.$(".next_import a")).toContainText("our_destination");

                                var destTable = new chorus.models.Dataset({
                                    id: "10000|Analytics|analytics|BASE_TABLE|our_destination",
                                    workspaceId: this.dataset.get("workspace").id
                                })
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
                                            creator: "InitialUser"
                                        }
                                    })

                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "edit_schedule"]);

                                it("has an 'imported xx ago' description", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo")
                                    var destTable = new chorus.models.Dataset({
                                        id: this.view.importConfiguration.get("destinationTable"),
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_imported", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "our_destination"})
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                });
                            });

                            context("when the import has failed to execute", function() {
                                beforeEach(function() {
                                    this.importResponse.set({
                                        executionInfo: {
                                            toTable: "bad_destination_table",
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
                                        id: this.view.importConfiguration.get("destinationTable"),
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_import_failed", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "bad_destination_table"})
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                    expect(this.view.$(".last_import img").attr("src")).toBe("/images/message_error_small.png");
                                });

                                itHasActionLinks(["import_now", "edit_schedule"]);
                            });

                            context("when the import has not yet executed", function() {
                                beforeEach(function() {
                                    this.importResponse.set({ executionInfo: null });
                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "edit_schedule"]);
                            });
                        });

                        context("when the dataset does not have an import schedule", function() {
                            beforeEach(function() {
                                this.importResponse = fixtures.datasetImport({
                                    scheduleInfo: null,
                                    toTable: "our_destination"
                                });
                                this.view.options.workspace = fixtures.workspace({ permission: ["update"] })
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
                                        id: this.view.importConfiguration.get("destinationTable"),
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_imported", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "our_destination"})
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
                                            creator: "InitialUser"
                                        }
                                    })

                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "create_schedule"]);

                                it("has an 'import failed xx ago' description", function() {
                                    var execInfo = this.view.importConfiguration.get("executionInfo")
                                    var destTable = new chorus.models.Dataset({
                                        id: this.view.importConfiguration.get("destinationTable"),
                                        workspaceId: this.dataset.get("workspace").id})
                                    expect(this.view.$(".last_import")).toContainTranslation("import.last_import_failed", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "our_destination"})
                                    expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                    expect(this.view.$(".last_import img").attr("src")).toBe("/images/message_error_small.png");
                                });
                            });

                            context("when the import has not yet executed", function() {
                                beforeEach(function() {
                                    this.importResponse.set({ executionInfo: null });
                                    this.server.completeFetchFor(this.view.importConfiguration, this.importResponse);
                                });

                                itHasActionLinks(["import_now", "create_schedule"]);
                            });
                        });

                        function itHasActionLinks(linkClasses) {
                            var possibleLinkClasses = ["import_now", "edit_schedule", "create_schedule"];

                            context("when the user has permission to update in the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = fixtures.workspace({ permission: ["update"] })
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
                                    this.view.options.workspace = fixtures.workspace({ permission: ["read"] })
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

                it("does not have a link to associate the dataset with a workspace", function() {
                    expect(this.view.$('.actions .associate')).not.toExist();
                });

                it("has the 'add a note' link with the correct data", function() {
                    var notesNew = this.view.$("a.dialog[data-dialog=NotesNew]");

                    expect(notesNew.data("entity-id")).toBe(this.dataset.get("id"));
                    expect(notesNew.data("entity-type")).toBe(this.dataset.entityType);
                    expect(notesNew.data("display-entity-type")).toBe(this.dataset.metaType());
                    expect(notesNew.attr("data-allow-workspace-attachments")).toBeDefined();
                });
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
                });
            });

        });

        describe("column statistics", function() {
            beforeEach(function() {
                this.dataset = fixtures.datasetSourceTable();
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
                this.view.statistics.set({lastAnalyzedTime: "2012-01-24 12:25:11.077"});
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
                        this.view.statistics.set({
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
            _.each(["QUERY", "VIEW", "TABLE", "BASE_TABLE", "HDFS_EXTERNAL_TABLE", "EXTERNAL_TABLE"], function(type){
                it("does not have any missing translations for"+type, function() {
                    this.dataset = fixtures.datasetSourceTable({objectType: type});
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                    expect(this.view.activityList.options.type).not.toContain("missing");
                })
            }, this)
        })
    });
});
