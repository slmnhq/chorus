describe("chorus.dialogs.ImportScheduler", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSourceTable();
        this.launchElement = $("<a/>");
        this.launchElement.data("dataset", this.dataset);
    });

    describe("importing on a schedule", function() {
        beforeEach(function() {
            this.launchElement.attr("data-use-schedule", "true");
            this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
            this.dialog.render();
        });

        it("should have the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("import_now.title_schedule");
        });

        it("should the right submit button text", function() {
            expect(this.dialog.submitText).toMatchTranslation("import_now.begin_schedule");
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [fixtures.datasetSandboxTable(), fixtures.datasetSandboxTable()]);
            });

            it("should have a checkbox for scheduling an import", function() {
                expect(this.dialog.$(".schedule_import label")).toContainTranslation("import_now.schedule_import");
            });
        });
    });

    describe("import now!", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
            this.dialog.render();
        });

        it("should have the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("import_now.title");
        });

        it("should the right submit button text", function() {
            expect(this.dialog.submitText).toMatchTranslation("import_now.begin");
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
                expect(this.dialog.$(".destination")).toContainTranslation("import_now.destination", {canonicalName: this.dataset.schema().canonicalName()})
            })

            it("should have a 'Begin Import' button", function() {
                expect(this.dialog.$("button.submit")).toContainTranslation("import_now.begin");
                expect(this.dialog.$("button.submit")).toBeDisabled();
            });

            it("should have an 'Import Into New Table' radio button", function() {
                expect(this.dialog.$(".new_table label")).toContainTranslation("import_now.new_table");
            });

            it("should have a 'Limit Rows' checkbox", function() {
                expect(this.dialog.$(".new_table .limit label")).toContainTranslation("import_now.limit_rows");
                expect(this.dialog.$(".new_table .limit input:checkbox").prop("checked")).toBeFalsy();
            });

            it("should have a textfield for the 'Limit Rows' value", function() {
                expect(this.dialog.$(".new_table .limit input:text")).toBeDisabled();
            });

            it("should have a text entry for new table name", function() {
                expect(this.dialog.$(".new_table .name")).toBeEnabled();
            });

            it("should have an import into existing table radio button", function() {
                expect(this.dialog.$(".existing_table label")).toContainTranslation("import_now.existing_table");
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

                describe("checking the import on a schedule checkbox", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.scheduleView, "enable");
                        this.dialog.$(".existing_table input[name='schedule']").prop("checked", true).change();
                    });

                    it("should enable the schedule view", function() {
                        expect(this.dialog.scheduleView.enable).toHaveBeenCalled();
                    });

                    context("when the schedule view is enabled", function() {
                        beforeEach(function() {
                            spyOn(this.dialog.scheduleView, "disable");
                            this.dialog.$(".existing_table input[name='schedule']").prop("checked", false).change();
                        });

                        it("should disable the schedule view", function() {
                            expect(this.dialog.scheduleView.disable).toHaveBeenCalled();
                        });
                    });
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

                        context("entering an invalid row limit", function() {
                            beforeEach(function() {
                                this.dialog.$(".new_table .limit input:text").val("ddd").trigger("keyup");
                            });

                            it("should keep the submit enabled when the row limit is unchecked", function() {
                                expect(this.dialog.$("button.submit")).toBeDisabled();
                                this.dialog.$(".new_table .limit input:checkbox").prop("checked", false).change();
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
                                expect(this.dialog.$("button.submit")).toContainTranslation("import_now.importing");
                            });

                            context("and the save is successful", function() {
                                beforeEach(function() {
                                    spyOn(chorus, "toast");
                                    spyOn(this.dialog, "closeModal");
                                    this.dialog.model.trigger("saved");
                                });

                                it("should display a toast", function() {
                                    expect(chorus.toast).toHaveBeenCalledWith("import_now.success");
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
                    })
                });
            });
        });
    })
});