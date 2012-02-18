describe("chorus.dialogs.TableImportCSV", function() {
    beforeEach(function() {

        chorus.page = {};
        this.sandbox = fixtures.sandbox({
            schemaName: "mySchema",
            databaseName: "myDatabase",
            instanceName: "myInstance"
        })
        chorus.page.workspace = fixtures.workspace();
        this.csv = fixtures.csvImport({lines: [
            "COL1,col2, col3 ,col 4,Col_5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5"
        ],
            toTable: "foo_quux_bar"
        });
        this.dialog = new chorus.dialogs.TableImportCSV({csv: this.csv});
        this.dialog.render();
    });

    it("has the title", function() {
        expect(this.dialog.$('h1')).toContainTranslation("dataset.import.table.title");
    });

    it("has an import button", function() {
        expect(this.dialog.$('button.submit')).toContainTranslation("dataset.import.table.submit");
    });

    it("has directions", function() {
        var sandbox = chorus.page.workspace.sandbox();
        expect(this.dialog.$('.directions')).toContainTranslation("dataset.import.table.directions",
            {
                canonicalName: sandbox.schema().canonicalName(),
                tablename_input_field: ''
            });

        expect(this.dialog.$(".directions input:text").val()).toBe("foo_quux_bar");
    });

    describe("the data table", function() {
        it("has the right number of column names", function() {
            expect(this.dialog.$(".data_table .thead .column_names .th input:text").length).toEqual(5);
        })

        it("converts the column names into db friendly format", function() {
            var $inputs = this.dialog.$(".data_table .thead .column_names .th input:text");
            expect($inputs.eq(0).val()).toBe("col1")
            expect($inputs.eq(1).val()).toBe("col2")
            expect($inputs.eq(2).val()).toBe("col3")
            expect($inputs.eq(3).val()).toBe("col_4")
            expect($inputs.eq(4).val()).toBe("col_5")
        })

        it("has the right number of column data types", function() {
            expect(this.dialog.$(".data_table .thead .data_types .th").length).toEqual(5);
        })

        it("has the right number of data columns", function() {
            expect(this.dialog.$(".data_table .tbody .column").length).toEqual(5);
        })

        it("displays the provided types", function() {
            _.each(this.dialog.$(".th .type"), function(th, index) {
                expect($(th).find(".chosen").text().trim()).toBe(this.csv.columnOrientedData()[index].type);
            }, this);
        });

        it("has the right data in each cell", function() {
            _.each(this.dialog.$(".data_table .tbody .column"), function(column, i) {
                var cells = $(column).find(".td")
                expect(cells.length).toEqual(3);
                _.each(cells, function(cell, j) {
                    expect($(cell)).toContainText("val" + (j + 1) + "." + (i + 1));
                })
            });
        });

        describe("selecting a new data type", function() {
            beforeEach(function() {
                this.$type = this.dialog.$(".th .type").eq(1)
                this.$type.find(".chosen").click();

                this.$type.find(".popup_filter li").eq(1).find("a").click();
            })

            it("changes the type of the column", function() {
                expect(this.$type.find(".chosen")).toHaveText("float");
                expect(this.$type).toHaveClass("float");
            })
        })
    });

    describe("clicking the import button", function() {
        beforeEach(function() {
            spyOn(this.dialog, "closeModal");
            this.dialog.$("button.submit").click();
        });

        it("starts the spinner", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
            expect(this.dialog.$("button.submit").text().trim()).toMatchTranslation("dataset.import.importing");
        });

        it("imports the file", function() {
            expect(this.server.lastCreate().url).toBe(this.dialog.csv.url());
            var params = this.server.lastCreate().params();
            expect(params.fileName).toBe(this.dialog.csv.get("fileName"));
            expect(params.toTable).toBe("foo_quux_bar");
            expect(params.delimiter).toBe(",");

            var expectedColumns = [];
            _.each(this.dialog.csv.columnOrientedData(), function(item, i) {
                expectedColumns.push({columnName: item.name, columnType: item.type, columnOrder: i + 1});
            });

            expect(JSON.parse(params.columnsDef)).toEqual(expectedColumns);
        });

        context("when the import succeeds", function() {
            beforeEach(function() {
                spyOn(chorus, 'toast');
                this.server.lastCreateFor(this.dialog.csv).succeed();
            });

            it("closes the dialog and displays a toast", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
                expect(chorus.toast).toHaveBeenCalledWith("dataset.import.success");
            });
        })

        context("when the import fails", function() {
            beforeEach(function() {
                this.server.lastCreateFor(this.dialog.csv).fail([{message: "oops"}]);
            });

            it("displays the error", function() {
                expect(this.dialog.$(".errors")).toContainText("oops");
            });

            it("re-enables the submit button", function() {
                expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
            })
        })

        context("when the user clicks cancel", function() {

        })

    })
});
