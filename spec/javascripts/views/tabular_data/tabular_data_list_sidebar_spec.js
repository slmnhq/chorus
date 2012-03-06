describe("chorus.views.TabularDataListSidebar", function() {
    beforeEach(function() {
        stubModals();
        this.view = new chorus.views.TabularDataListSidebar();
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

        describe("tabularData:selected event handling", function() {
            context("when a dataset is selected", function() {
                beforeEach(function() {
                    this.server.reset();
                    this.dataset = fixtures.datasetSourceTable();
                    chorus.PageEvents.broadcast("tabularData:selected", this.dataset);
                });

                it("doesn't display any import links", function() {
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
                        context("and the dataset doesn't have an import schedule", function() {
                            beforeEach(function() {
                                this.server.completeFetchFor(this.dataset.getImport(), []);
                            });

                            context("and the current user has update permissions on the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = fixtures.workspace({ permission: ["update"] })
                                    this.view.render();
                                });

                                it("has a 'create import schedule' link", function() {
                                    var createScheduleLink = this.view.$("a.create_schedule");
                                    expect(createScheduleLink.text()).toMatchTranslation("actions.create_schedule");
                                });

                                it("should have the dataset attached as data-dataset", function() {
                                    expect(this.view.$("a.create_schedule[data-dialog=ImportScheduler]").data("dataset")).toBe(this.dataset);
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

                        context("and the dataset has an import schedule", function() {
                            beforeEach(function() {
                                this.server.completeFetchFor(this.dataset.getImport(), fixtures.datasetImport());
                            });

                            context("and the current user has update permissions on the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = fixtures.workspace({ permission: ["update"] })
                                    this.view.render();
                                });

                                it("has an 'edit import schedule' link", function() {
                                    var editScheduleLink = this.view.$("a.edit_schedule.dialog");
                                    expect(editScheduleLink.data("dialog")).toBe("ImportScheduler");
                                    expect(editScheduleLink.text()).toMatchTranslation("actions.edit_schedule");
                                });

                                it("should have the dataset attached as data-dataset", function() {
                                    expect(this.view.$("a.import_now[data-dialog=ImportScheduler]").data("dataset")).toBe(this.dataset);
                                    expect(this.view.$("a.edit_schedule[data-dialog=ImportScheduler]").data("dataset")).toBe(this.dataset);
                                });

                                it("has an import now link", function() {
                                    var importNowLink = this.view.$("a.import_now.dialog");
                                    expect(importNowLink.text()).toMatchTranslation("actions.import_now");
                                    expect(importNowLink.data("dialog")).toBe("ImportScheduler");
                                });
                            })

                            context("and the current user does not have update permissions on the workspace", function() {
                                beforeEach(function() {
                                    this.view.options.workspace = fixtures.workspace({ permission: ["read"] })
                                    this.view.render();
                                });

                                it("does not have an 'edit import schedule' link", function() {
                                    expect(this.view.$("a.edit_schedule.dialog")).not.toExist();
                                });

                                it("does not have an import now link", function() {
                                    expect(this.view.$("a.import_now.dialog")).not.toExist();
                                });
                            });

                            it("doesn't have a 'create import schedule' link'", function() {
                                expect(this.view.$(".actions .create_schedule")).not.toExist();
                            });

                            it("shows the next import time", function() {
                                expect(this.view.$(".next_import").html()).toContain("in 1 year");
                            });
                        });

                        context("and the dataset has an import config, but no schedule", function() {
                            beforeEach(function() {
                                var importConfig = fixtures.datasetImport();
                                importConfig.get('scheduleInfo').jobName = null;
                                this.server.completeFetchFor(this.dataset.getImport(), importConfig);
                                this.view.options.workspace = fixtures.workspace({ permission: ["update"] })
                                this.view.render();
                            });

                            it("has a 'create import schedule' link", function() {
                                expect(this.view.$("a.create_schedule")).toExist();
                            });
                        });

                        context("and the dataset has a recent successful import", function() {
                            beforeEach(function() {
                                this.server.completeFetchFor(this.dataset.getImport(), fixtures.datasetImportSuccessful({id: '1234', toTable: "aToTable", datasetId: this.dataset.id, workspaceId: this.dataset.get("workspace").id}).attributes);
                            });

                            it("has an 'imported xx ago' description", function() {
                                var execInfo = this.view.importConfiguration.get("executionInfo")
                                var destTable = new chorus.models.Dataset({
                                    id: this.view.importConfiguration.get("destinationTable"),
                                    workspaceId: this.dataset.get("workspace").id})
                                expect(this.view.$(".last_import")).toContainTranslation("import.last_imported", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "aToTable"})
                                expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                            });
                        });

                        context("and the dataset has a recent failed import", function() {
                            beforeEach(function() {
                                this.server.completeFetchFor(this.dataset.getImport(), fixtures.datasetImportFailed({id: '1234', toTable: "aToTable", datasetId: this.dataset.id, workspaceId: this.dataset.get("workspace").id}).attributes);
                            });

                            it("has an 'import failed xx ago' description", function() {
                                var execInfo = this.view.importConfiguration.get("executionInfo")
                                var destTable = new chorus.models.Dataset({
                                    id: this.view.importConfiguration.get("destinationTable"),
                                    workspaceId: this.dataset.get("workspace").id})
                                expect(this.view.$(".last_import")).toContainTranslation("import.last_import_failed", {timeAgo: chorus.helpers.relativeTimestamp(execInfo.completedStamp), tableLink: "aToTable"})
                                expect(this.view.$(".last_import a")).toHaveHref(destTable.showUrl())
                                expect(this.view.$(".last_import img").attr("src")).toBe("/images/message_error_small.png");
                            });
                        });

                        function itHasAnImportNowLink() {
                            it("has an import now link", function() {
                                var importNowLink = this.view.$("a.import_now.dialog");
                                expect(importNowLink.text()).toMatchTranslation("actions.import_now");
                                expect(importNowLink.data("dialog")).toBe("ImportScheduler");
                            });
                        }
                    });
                });

                it("displays the selected dataset name", function() {
                    expect(this.view.$(".name").text().trim()).toBe(this.dataset.get("objectName"))
                });

                it("displays the selected dataset type", function() {
                    expect(this.view.$(".type").text().trim()).toBe(Handlebars.helpers.humanizedTabularDataType(this.dataset.attributes))
                });

                it("displays the 'Preview Data' link", function() {
                    expect(this.view.$('.actions .dialog.tabular_data_preview').data('dialog')).toBe('TabularDataPreview');
                    expect(this.view.$('.actions .tabular_data_preview')).toContainTranslation('actions.tabular_data_preview');
                });

                context("when hasCredentials is false for the dataset", function() {
                    beforeEach(function() {
                        this.dataset.set({hasCredentials: false})
                        this.view.render();
                    });

                    it("does not show the preview data link", function() {
                        expect(this.view.$('.actions .tabular_data_preview')).not.toExist();
                    });

                    it("does not have the 'Import Now' action", function() {
                        expect(this.view.$(".actions .import_now")).not.toExist();
                    });

                    it("shows a no-permissions message", function() {
                        expect(this.view.$('.no_credentials')).toContainTranslation("dataset.credentials.missing.body", {linkText: t("dataset.credentials.missing.linkText")});
                    });

                    context("clicking on the link to add credentials", function() {
                        beforeEach(function() {
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

                it("fetches the activities for the dataset", function() {
                    expect(this.dataset.activities()).toHaveBeenFetched()
                });

                it("prefers only the without_workspace type for the activity list", function() {
                    expect(this.view.activityList.options.displayStyle).toEqual(['without_workspace']);
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

                context("when browsing a schema", function() {
                    beforeEach(function() {
                        this.view.options.browsingSchema = true;
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

                    it("prefers only the without_workspace type for the activity list", function() {
                        expect(this.view.activityList.options.displayStyle).toEqual(['without_workspace']);
                    });

                    it("has a link to associate the dataset with a workspace", function() {
                        expect(this.view.$('.actions .associate')).toContainTranslation('actions.associate_with_workspace');
                    });

                    describe("when the 'associate with workspace' link is clicked", function() {
                        beforeEach(function() {
                            this.view.$("li.associate a").click();
                        });

                        it("displays the associate with workspace dialog", function() {
                            expect(chorus.modal).toBeA(chorus.dialogs.AssociateWithWorkspace);
                        });
                    });
                });

                describe("when the activity fetch completes", function() {
                    beforeEach(function() {
                        this.server.completeFetchFor(this.dataset.activities());
                    });

                    it("renders an activity list inside the tabbed area", function() {
                        expect(this.view.activityList).toBeA(chorus.views.ActivityList);
                        expect(this.view.activityList.el).toBe(this.view.$(".tabbed_area .activity_list")[0]);
                    });
                });

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
                            this.view = new chorus.views.TabularDataListSidebar();
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
                            this.view = new chorus.views.TabularDataListSidebar();
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
    });
});
