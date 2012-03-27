describe("chorus.dialogs.ImportScheduler", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSourceTable();
        this.datasetImport = fixtures.datasetImport({
            datasetId: this.dataset.get('id'),
            workspaceId: this.dataset.get('workspace').id
        });
        this.workspace = fixtures.workspace(this.dataset.get('workspace'));
        this.datasetImport.unset('sampleCount');
        this.launchElement = $("<a/>");
        this.launchElement.data("dataset", this.dataset);
        this.launchElement.data("workspace", this.workspace);
    });

    describe("#getNewModelAttrs", function() {
        describe("when creating a new schedule", function() {
            beforeEach(function() {
                this.launchElement.addClass("create_schedule")
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchFor(this.datasetImport);
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxView(),
                    fixtures.datasetExternalTable(),
                    fixtures.datasetHadoopExternalTable()
                ]);
                this.dialog.$(".new_table input:radio").prop("checked", false);
                this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                this.dialog.$(".existing_table input[name='schedule']").prop("checked", true).change();
                this.attrs = this.dialog.getNewModelAttrs();
            });

            it("takes the workspace from the launch-element", function() {
                expect(this.dialog.workspace).toBe(this.workspace);
            });

            it("has the 'importType' parameter set to 'schedule'", function() {
                expect(this.attrs.importType).toBe("schedule");
            });
        });

        describe("when editing an existing schedule", function() {
            beforeEach(function() {
                this.launchElement.addClass("edit_schedule")
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchFor(this.datasetImport);
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxView(),
                    fixtures.datasetExternalTable(),
                    fixtures.datasetHadoopExternalTable()
                ]);
                this.dialog.$(".new_table input:radio").prop("checked", false);
                this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                this.dialog.$(".existing_table input[name='schedule']").prop("checked", true).change();
                this.attrs = this.dialog.getNewModelAttrs();
            });

            it("has the 'importType' parameter set to 'schedule'", function() {
                expect(this.attrs.importType).toBe("schedule");
            });

            context("when the dialog has errors", function() {
                beforeEach(function() {
                    spyOn(this.dialog.model, "clearErrors")
                })

                it("clears any errors on the model when the dialog is closed", function() {
                    this.dialog.model.errors = { name: "wrong name" }
                    this.dialog.$("button.cancel").click()
                    expect(this.dialog.model.clearErrors).toHaveBeenCalled()
                })
            })
        });

        describe("when doing a single import", function() {
            beforeEach(function() {
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxView(),
                    fixtures.datasetExternalTable(),
                    fixtures.datasetHadoopExternalTable()
                ]);
                this.server.completeFetchFor(this.datasetImport);
                this.attrs = this.dialog.getNewModelAttrs();
            });

            it("has the 'importType' parameter set to 'oneTime'", function() {
                expect(this.attrs.importType).toBe("oneTime");
            });

            it("does not include any scheduling parameters", function() {
                expect(_.find(this.attrs, function(val, key) { return key.indexOf("schedule") == 0 })).toBeFalsy();
            });
        });
    });

    describe("creating a new schedule", function() {
        beforeEach(function() {
            this.launchElement.addClass("create_schedule");
            this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
            this.server.completeFetchFor(this.datasetImport, []);
            spyOn(chorus.views.ImportSchedule.prototype, "enable");
            this.dialog.render();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxView(),
                    fixtures.datasetExternalTable(),
                    fixtures.datasetHadoopExternalTable()
                ]);
                this.dialog.$(".new_table input.name").val("abc").trigger("keyup");
            });

            it("should have a checkbox for scheduling an import", function() {
                expect(this.dialog.$(".schedule_import label")).toContainTranslation("import.schedule_import");
                expect(this.dialog.$(".schedule_import input:checkbox")).toBeChecked();
                expect(this.dialog.$(".schedule_import").not(".hidden")).not.toExist();
            });

            it("should have a truncate checkbox for a new table", function() {
                expect(this.dialog.$("#import_scheduler_truncate_new")).toExist();
            });

            it("should set executeAfterSave to be false on the DatasetImport", function() {
                expect(this.dialog.model.executeAfterSave).toBeFalsy();
            });

            it("should have the correct title", function() {
                expect(this.dialog.title).toMatchTranslation("import.title_schedule");
            });

            it("should have the right submit button text", function() {
                expect(this.dialog.submitText).toMatchTranslation("import.begin_schedule");
            });

            it("should show the schedule controls", function() {
                expect(this.dialog.$(".schedule_import")).toExist();
                expect(this.dialog.$(".schedule_widget")).toExist();
            });

            it("should not include views, external tables, or Hadoop tables in the dropdown", function() {
                expect(this.dialog.$(".existing_table .names option").length).toBe(2);
            });

            it("sets the time fields to the model defaults", function() {
                expect(this.dialog.$('.new_table select.hours')).toHaveValue(this.dialog.model.startTime().toString("h"));
            });

            context("when 'Import into New Table' is checked", function() {
                itShouldHaveAllTheFields(".new_table");
            });

            context("when 'Import into Existing Table' is checked", function() {
                beforeEach(function() {
                    this.dialog.activeScheduleView.enable.reset();
                    this.dialog.$(".new_table input:radio").prop("checked", false);
                    this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                });

                itShouldHaveAllTheFields(".existing_table");
            });


            function itShouldHaveAllTheFields(selector) {
                it("should enable the schedule view", function() {
                    expect(chorus.views.ImportSchedule.prototype.enable).toHaveBeenCalled();
                });

                context("when all the fields are filled out and the form is submitted", function() {
                    beforeEach(function() {
                        this.dialog.$("input:checked[name='truncate']").prop("checked", false).change();

                        this.dialog.$("select[name='toTable']").eq(0).attr("selected", true);

                        this.dialog.$("input[name='limit_num_rows']").prop("checked", true).change();
                        this.dialog.$("input[name='sampleCount']").val(123);

                        this.dialog.activeScheduleView.$(".start input[name='year']").val("2012");
                        this.dialog.activeScheduleView.$(".start input[name='month']").val("02");
                        this.dialog.activeScheduleView.$(".start input[name='day']").val("29");

                        this.dialog.activeScheduleView.$(".end input[name='year']").val("2012");
                        this.dialog.activeScheduleView.$(".end input[name='month']").val("03");
                        this.dialog.activeScheduleView.$(".end input[name='day']").val("21");

                        this.dialog.activeScheduleView.$("select.ampm").val("PM");
                        this.dialog.activeScheduleView.$("select.hours").val("12");
                        this.dialog.activeScheduleView.$("select.minutes").val("09");

                        expect(this.dialog.$("button.submit")).toBeEnabled();

                        this.dialog.$("button.submit").click();
                    });

                    it("should put the values in the correct API form fields", function() {
                        var params = this.server.lastCreate().params()
                        expect(params.truncate).toBe("false");
                        expect(params.sampleCount).toBe("123");
                        expect(params.scheduleStartTime).toBe("2012-02-29 12:09:00.0");
                        expect(params.scheduleEndTime).toBe("2012-03-21")
                    });
                });

                context("when the row limit is not checked and the form is submitted", function() {
                    beforeEach(function() {
                        this.dialog.$("input:checked[name='truncate']").prop("checked", false).change();

                        this.dialog.$("select[name='toTable']").eq(0).attr("selected", true);

                        this.dialog.$("input[name='limit_num_rows']").prop("checked", false)

                        this.dialog.activeScheduleView.$(".start input[name='year']").val("2012");
                        this.dialog.activeScheduleView.$(".start input[name='month']").val("02");
                        this.dialog.activeScheduleView.$(".start input[name='day']").val("29");

                        this.dialog.activeScheduleView.$(".end input[name='year']").val("2012");
                        this.dialog.activeScheduleView.$(".end input[name='month']").val("03");
                        this.dialog.activeScheduleView.$(".end input[name='day']").val("21");

                        this.dialog.activeScheduleView.$("select.ampm").val("PM");
                        this.dialog.activeScheduleView.$("select.hours").val("12");
                        this.dialog.activeScheduleView.$("select.minutes").val("09");

                        expect(this.dialog.$("button.submit")).toBeEnabled();

                        this.dialog.$("button.submit").click();
                    });

                    it("should put the values in the correct API form fields", function() {
                        var params = this.server.lastCreate().params()
                        expect(params.truncate).toBe("false");
                        expect(params.sampleCount).toBe('0');
                        expect(params.scheduleStartTime).toBe("2012-02-29 12:09:00.0");
                        expect(params.scheduleEndTime).toBe("2012-03-21")
                    });

                });
            }

            describe("switching between new table and existing table", function() {
                context("switching from new to existing", function() {
                    beforeEach(function() {
                        this.dialog.$(".new_table input:radio").prop("checked", true).change();
                        this.dialog.$(".existing_table input:radio").prop("checked", false);
                        spyOn(this.dialog, 'clearErrors');
                        this.dialog.$(".new_table input:radio").prop("checked", false);
                        this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                    })
                    
                    it("clears the errors", function() {
                        expect(this.dialog.clearErrors).toHaveBeenCalled();
                    })

                    it("sets the time fields to the model defaults", function() {
                        expect(this.dialog.$('.existing_table select.hours')).toHaveValue(this.dialog.model.startTime().toString("h"));
                    });
                })
                context("switching from existing to new", function() {
                    beforeEach(function() {
                        this.dialog.$(".new_table input:radio").prop("checked", false);
                        this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                        spyOn(this.dialog, 'clearErrors');
                        this.dialog.$(".new_table input:radio").prop("checked", true).change();
                        this.dialog.$(".existing_table input:radio").prop("checked", false);
                    })
                    
                    it("clears the errors", function() {
                        expect(this.dialog.clearErrors).toHaveBeenCalled();
                    })
                })
            })
        });
    });

    describe("editing an existing schedule", function() {
        describe("when the schedule is active", function() {
            beforeEach(function() {
                this.datasetImport.set({
                    truncate: true,
                    sampleCount: 200,
                    scheduleInfo: {
                        startTime: "2013-02-21 13:30:00.0",
                        endTime: "2013-05-27",
                        frequency: "HOURLY",
                        jobName: "job123"
                    },
                    toTable: "my_table",
                    destinationTable: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"my_table"',
                    sourceId: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"somebodys_table"'
                });
                this.launchElement.addClass("edit_schedule");
                this.dataset.setImport(this.import);
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchFor(this.datasetImport);
                this.dialog.render();
            });

            describe("when the sandbox table fetch completes", function() {
                context("and the toTable is not an existing Table", function() {
                    beforeEach(function() {
                        this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                            fixtures.datasetSandboxTable({ objectName: "your_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"your_table"' }),
                            fixtures.datasetSandboxTable({ objectName: "not_my_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"not_my_table"' }),
                            fixtures.datasetSandboxTable({ objectName: "her_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"her_table"' })
                        ]);
                    });

                    it("initially has no errors", function() {
                        expect(this.dialog.$(".has_error")).not.toExist();
                    });

                    it("has the right title", function() {
                        expect(this.dialog.title).toMatchTranslation("import.title_edit_schedule");
                    });

                    it("has a submit button with the right text", function() {
                        expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.save_changes");
                    });

                    it("has the right fieldset selected", function() {
                        expect(this.dialog.$("input[type='radio']#import_scheduler_existing_table")).not.toBeChecked();
                        expect(this.dialog.$("input[type='radio']#import_scheduler_new_table")).toBeChecked();
                        expect(this.dialog.$(".existing_table fieldset")).toHaveClass("disabled");
                        expect(this.dialog.$(".new_table fieldset")).not.toHaveClass("disabled");
                    });

                    it("pre-populates the table name", function() {
                        expect(this.dialog.$(".new_table input.name").val()).toBe("my_table");
                    })

                    it("should have a truncate checkbox for a new table", function() {
                        expect(this.dialog.$("#import_scheduler_truncate_new")).toExist();
                    });
                });

                context("and the toTable is an existing Table", function() {
                    beforeEach(function() {
                        this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                            fixtures.datasetSandboxTable({ objectName: "your_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"your_table"' }),
                            fixtures.datasetSandboxTable({ objectName: "my_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"my_table"' }),
                            fixtures.datasetSandboxTable({ objectName: "her_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"her_table"' })
                        ]);
                    });

                    it("has a visible schedule_import checkbox", function() {
                        expect(this.dialog.$(".schedule_import.hidden")).not.toExist();
                    });

                    it("has the right title", function() {
                        expect(this.dialog.title).toMatchTranslation("import.title_edit_schedule");
                    });

                    it("has a submit button with the right text", function() {
                        expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.save_changes");
                    });

                    it("has the right fieldset selected", function() {
                        expect(this.dialog.$("input[type='radio']#import_scheduler_existing_table")).toBeChecked();
                        expect(this.dialog.$("input[type='radio']#import_scheduler_new_table")).not.toBeChecked();
                        expect(this.dialog.$(".existing_table fieldset")).not.toHaveClass("disabled");
                        expect(this.dialog.$(".new_table fieldset")).toHaveClass("disabled");
                    });

                    it("should have a truncate checkbox for a new table", function() {
                        expect(this.dialog.$("#import_scheduler_truncate_new")).toExist();
                    });

                    it("has the 'schedule' checkbox checked by default", function() {
                        expect(this.dialog.$("input[name='schedule']")).toBeChecked();
                    });

                    it("pre-populates the schedule fields with the import's settings", function() {
                        expect(this.dialog.activeScheduleView.$(".start input[name='year']").val()).toBe("2013");
                        expect(this.dialog.activeScheduleView.$(".start input[name='month']").val()).toBe("2");
                        expect(this.dialog.activeScheduleView.$(".start input[name='day']").val()).toBe("21");

                        expect(this.dialog.activeScheduleView.$(".hours").val()).toBe("1");
                        expect(this.dialog.activeScheduleView.$(".minutes").val()).toBe("30");
                        expect(this.dialog.activeScheduleView.$(".ampm").val()).toBe("PM");

                        expect(this.dialog.activeScheduleView.$(".end input[name='year']").val()).toBe("2013");
                        expect(this.dialog.activeScheduleView.$(".end input[name='month']").val()).toBe("5");
                        expect(this.dialog.activeScheduleView.$(".end input[name='day']").val()).toBe("27");
                    });

                    it("pre-populates the destination table and truncation fields with the import's settings", function() {
                        expect(this.dialog.$("select[name='toTable']").val()).toBe("my_table");
                        expect(this.dialog.$(".truncate")).toBeChecked();
                    });

                    it("pre-populates the row limit", function() {
                        expect(this.dialog.$("input[name='limit_num_rows']")).toBeChecked();
                        expect(this.dialog.$("input[name='sampleCount']").val()).toBe("200");
                    });

                    it("pre-populates the row limit to 500 when row limit is 0", function() {
                        this.dialog.model.set({sampleCount: '0'});
                        this.dialog.render();
                        expect(this.dialog.$("input[name='sampleCount']").val()).toBe("500");
                    });

                    it("sets activateSchedule to false, not null, on submission", function() {
                        this.dialog.$("input[name='schedule']").prop("checked", false);
                        this.dialog.$("button.submit").trigger("click");
                        // must explicitly be false https://www.pivotaltracker.com/story/show/25783061
                        expect(this.server.lastUpdate().params().activateSchedule).toBe("false");
                    });

                    describe("submitting the form", function() {
                        beforeEach(function() {
                            this.dialog.$("input[name='limit_num_rows']").prop("checked", false)
                            this.dialog.$("input[name='sampleCount']").val("201");
                            this.dialog.$("button.submit").trigger("click");
                        });

                        it("has the right loading text in the submit button", function() {
                            expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.saving");
                        });

                        it("sends activateSchedule", function() {
                            // must explicitly be true https://www.pivotaltracker.com/story/show/25783061
                            expect(this.server.lastUpdate().params().activateSchedule).toBe("true");
                        });

                        it('correctly sets sampleCount to 0 when limit_num_rows is unchecked', function() {
                            expect(this.server.lastUpdate().params().sampleCount).toBe('0');
                        });

                        context("when the save completes", function() {
                            beforeEach(function() {
                                spyOnEvent(this.dataset, 'change');
                                spyOn(chorus.PageEvents, 'broadcast');
                                spyOn(chorus, "toast");
                                spyOn(this.dialog, "closeModal");
                                this.dialog.model.trigger("saved");
                            });

                            it("displays the right toast message", function() {
                                expect(chorus.toast).toHaveBeenCalledWith("import.schedule.toast");
                            });

                            it("triggers a importSchedule:changed event", function() {
                                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("importSchedule:changed", this.dialog.model);
                            });

                            it("triggers change on the dataset", function() {
                                expect('change').toHaveBeenTriggeredOn(this.dataset);
                            })
                        });
                    });
                });
            });
        });

        describe("when the schedule is inactive", function() {
            beforeEach(function() {
                this.datasetImport.set({
                    truncate: true,
                    sampleCount: 200,
                    scheduleInfo: {
                        startTime: "2013-02-21 13:30:00.0",
                        endTime: "2013-05-27",
                        frequency: "HOURLY"
                    },
                    toTable: "my_table",
                    destinationTable: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"my_table"',
                    sourceId: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"somebodys_table"'
                });
                this.launchElement.addClass("edit_schedule");
                this.dataset.setImport(this.import);
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchFor(this.datasetImport);
                this.dialog.render();
            });

            describe("when the sandbox table fetch completes", function() {
                context("and the toTable is not an existing Table", function() {
                    beforeEach(function() {
                        this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                            fixtures.datasetSandboxTable({ objectName: "your_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"your_table"' }),
                            fixtures.datasetSandboxTable({ objectName: "not_my_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"not_my_table"' }),
                            fixtures.datasetSandboxTable({ objectName: "her_table", id: '"10000"|"dca_demo"|"ddemo"|"BASE_TABLE"|"her_table"' })
                        ]);
                    });

                    it("initially has no errors", function() {
                        expect(this.dialog.$(".has_error")).not.toExist();
                    });

                    it("has the 'schedule' checkbox unchecked by default", function() {
                        expect(this.dialog.$("input[name='schedule']")).not.toBeChecked();
                    });

                    it("pre-populates the schedule fields with the import's settings", function() {
                        expect(this.dialog.activeScheduleView.$(".start input[name='year']").val()).toBe("2013");
                        expect(this.dialog.activeScheduleView.$(".start input[name='month']").val()).toBe("2");
                        expect(this.dialog.activeScheduleView.$(".start input[name='day']").val()).toBe("21");

                        expect(this.dialog.activeScheduleView.$(".hours").val()).toBe("1");
                        expect(this.dialog.activeScheduleView.$(".minutes").val()).toBe("30");
                        expect(this.dialog.activeScheduleView.$(".ampm").val()).toBe("PM");

                        expect(this.dialog.activeScheduleView.$(".end input[name='year']").val()).toBe("2013");
                        expect(this.dialog.activeScheduleView.$(".end input[name='month']").val()).toBe("5");
                        expect(this.dialog.activeScheduleView.$(".end input[name='day']").val()).toBe("27");
                    });

                })
            });
        });
    });

    describe("import now!", function() {
        context("with an existing import", function() {
            beforeEach(function() {
                this.launchElement.addClass("import_now");
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchFor(this.datasetImport);
                spyOn(this.dialog.model, "isNew").andReturn(false)
                this.dialog.render();
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [fixtures.datasetSandboxTable(), fixtures.datasetSandboxTable()]);
                this.dialog.$(".new_table input.name").val("good_table_name").trigger("keyup");
                expect(this.dialog.$("button.submit")).toBeEnabled();
            });
            it("does a post when the form is submitted", function() {
                this.dialog.$("button.submit").click();
                expect(this.server.lastCreate().url).toContain('import');
            });

            it("should not have a truncate checkbox for a new table", function() {
                expect(this.dialog.$("#import_scheduler_truncate_new")).not.toExist();
            });
        });

        beforeEach(function() {
            this.launchElement.addClass("import_now");
            this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
            this.server.completeFetchFor(this.datasetImport);
            this.dialog.render();
        });

        it("should hide the schedule controls", function() {
            expect(this.dialog.$(".schedule_import")).not.toExist();
            expect(this.dialog.$(".schedule_widget")).not.toExist();
        });

        it("should have the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("import.title");
        });

        it("should the right submit button text", function() {
            expect(this.dialog.submitText).toMatchTranslation("import.begin");
        });

        it("should initialize its model with the correct datasetId and workspaceId", function() {
            expect(this.dialog.model.get("datasetId")).toBe(this.dataset.get("id"));
            expect(this.dialog.model.get("workspaceId")).toBe(this.dataset.get("workspace").id);
        });

        it("should display a loading section", function() {
            expect(this.dialog.$(".loading_section")).toExist();
        })

        it("should fetch the list of sandbox tables", function() {
            expect(this.server.lastFetchAllFor(this.dialog.sandboxTables)).toBeDefined();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [fixtures.datasetSandboxTable(), fixtures.datasetSandboxTable()]);
            });

            it("should populate the table dropdown", function() {
                expect(this.dialog.$(".existing_table .names option").length).toBe(2);
            });

            it("should display the import destination", function() {
                expect(this.dialog.$(".destination")).toContainTranslation("import.destination", {canonicalName: this.workspace.sandbox().schema().canonicalName()})
            })

            it("should have a 'Begin Import' button", function() {
                expect(this.dialog.$("button.submit")).toContainTranslation("import.begin");
            });

            it("should have an 'Import Into New Table' radio button", function() {
                expect(this.dialog.$(".new_table label")).toContainTranslation("import.new_table");
            });

            it("should have a 'Limit Rows' checkbox", function() {
                expect(this.dialog.$(".new_table .limit label")).toContainTranslation("import.limit_rows");
                expect(this.dialog.$(".new_table .limit input:checkbox").prop("checked")).toBeFalsy();
            });

            it("should not have a truncate checkbox for a new table", function() {
                expect(this.dialog.$("#import_scheduler_truncate_new")).not.toExist();
            });

            it("should have a textfield for the 'Limit Rows' value", function() {
                expect(this.dialog.$(".new_table .limit input:text")).toBeDisabled();
            });

            it("should have a text entry for new table name", function() {
                expect(this.dialog.$(".new_table .name")).toBeEnabled();
            });

            it("should have an import into existing table radio button", function() {
                expect(this.dialog.$(".existing_table label")).toContainTranslation("import.existing_table");
            });

            it("should have a dropdown selector for existing tables", function() {
                expect(this.dialog.$(".existing_table .names")).toBeDisabled();
            });

            context("when 'Import into Existing Table' is checked", function() {
                beforeEach(function() {
                    this.dialog.$(".new_table input:radio").prop("checked", false);
                    this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                });

                it("should enable the select", function() {
                    expect(this.dialog.$(".existing_table .names")).toBeEnabled();
                    expect(this.dialog.$(".new_table .name")).toBeDisabled();
                });

                it("should enable the submit button", function() {
                    expect(this.dialog.$("button.submit")).toBeEnabled();
                });

                context("and the form is submitted", function() {
                    beforeEach(function() {
                        this.dialog.$(".existing_table .truncate").prop("checked", true).change();
                        this.dialog.$("button.submit").click();
                    });

                    it("should save the model", function() {
                        expect(this.server.lastCreateFor(this.dialog.model).params().truncate).toBe("true");
                    });
                });

                context("when 'Import into New Table' is checked and a valid name is entered", function() {
                    beforeEach(function() {
                        this.dialog.$(".new_table input:radio").prop("checked", true).change();
                        this.dialog.$(".existing_table input:radio").prop("checked", false).change();
                        this.dialog.$(".new_table input.name").val("Foo").trigger("keyup");
                    });

                    it("should disable the 'Existing Table' dropdown", function() {
                        expect(this.dialog.$(".new_table .name")).toBeEnabled();
                        expect(this.dialog.$(".existing_table .names")).toBeDisabled();
                    });

                    context("checking the limit rows checkbox", function() {
                        beforeEach(function() {
                            this.dialog.$(".new_table .limit input:checkbox").prop("checked", true).change();
                        });

                        it("should enable the limit text input", function() {
                            expect(this.dialog.$(".new_table .limit input:text")).toBeEnabled();
                        });

                        context("entering a valid row limit", function() {
                            beforeEach(function() {
                                this.dialog.$(".new_table .limit input:text").val("345").trigger("keyup");
                            });

                            it("should enable the submit button when a row limit is entered", function() {
                                expect(this.dialog.$("button.submit")).toBeEnabled();
                            });
                        });
                    });

                    context("when the inputs are filled with valid values", function() {
                        beforeEach(function() {
                            this.dialog.$(".new_table input.name").val("good_table_name").trigger("keyup");
                        });

                        it("enables the submit button", function() {
                            expect(this.dialog.$("button.submit")).toBeEnabled();
                        });

                        context("when the form is submitted", function() {
                            beforeEach(function() {
                                this.dialog.$("button.submit").click();
                            });

                            it("should save the model", function() {
                                expect(this.server.lastCreateFor(this.dialog.model)).toBeDefined();
                            });

                            it("should put the submit button in the loading state", function() {
                                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                                expect(this.dialog.$("button.submit")).toContainTranslation("import.importing");
                            });

                            context("and the save is successful", function() {
                                beforeEach(function() {
                                    spyOn(chorus, "toast");
                                    spyOn(this.dialog, "closeModal");
                                    this.server.completeSaveFor(this.dialog.model);
                                });

                                it("should display a toast", function() {
                                    expect(chorus.toast).toHaveBeenCalledWith("import.success");
                                });

                                it("should close the dialog", function() {
                                    expect(this.dialog.closeModal).toHaveBeenCalled();
                                });
                            });

                            context("and the save is not successful", function() {
                                beforeEach(function() {
                                    this.server.lastCreate().fail();
                                });

                                it("should not display the loading spinner", function() {
                                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
