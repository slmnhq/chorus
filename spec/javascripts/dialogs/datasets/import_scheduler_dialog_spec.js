describe("chorus.dialogs.ImportScheduler", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSourceTable();
        this.launchElement = $("<a/>");
        this.launchElement.data("dataset", this.dataset);
        this.dialog = new chorus.dialogs.ImportScheduler({launchElement : this.launchElement});
        this.dialog.render();
    });

    it("should have the correct title", function() {
        expect(this.dialog.title).toMatchTranslation("import_now.title");
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

        it("should disable the 'New Table' text field", function() {
            expect(this.dialog.$(".new_table .name")).toBeDisabled();
            expect(this.dialog.$(".existing_table .names")).toBeEnabled();
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
                    this.dialog.$(".new_table input:text").val("good_table_name").trigger("keyup");
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
                            this.dialog.model.trigger("saved");
                        });

                        it("should display a toast", function() {
                            expect(chorus.toast).toHaveBeenCalledWith("import_now.success");
                        });
                    });
                });
            })
        });
    });
});