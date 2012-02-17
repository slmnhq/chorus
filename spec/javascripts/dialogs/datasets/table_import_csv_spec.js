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
            "col1,col2,col3,col4,col5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5"
        ]});
        this.dialog = new chorus.dialogs.TableImportCSV({csv: this.csv, tablename: "bar"});
        this.dialog.render();
    });

    it("has the title", function() {
        expect(this.dialog.$('h1')).toContainTranslation("dataset.import.table.title");
    });

    it("has an import button", function() {
        expect(this.dialog.$('button.submit')).toContainTranslation("dataset.import.table.submit");
    });

    xit("has directions", function() {
        var sandbox = chorus.page.workspace.sandbox();
        expect(this.dialog.$('.directions').html().trim()).toEqual(t("dataset.import.table.directions",
            _.extend(sandbox.attributes, {
                tablename_input_field: '<input type="text" name="table_name" value="bar">'
            })));
    });

    describe("the data table", function() {
        it("has the right number of column names", function() {
            expect(this.dialog.$(".data_table .thead .column_names .th input:text").length).toEqual(5);
        })

        it("has the right number of column data types", function() {
            expect(this.dialog.$(".data_table .thead .data_types .th").length).toEqual(5);

        })

        it("has the right number of data columns", function() {
            expect(this.dialog.$(".data_table .tbody .column").length).toEqual(5);
        })

        it("has the right data in each cell", function() {
            _.each(this.dialog.$(".data_table .tbody .column"), function(column, i) {
                var cells = $(column).find(".td")
                expect(cells.length).toEqual(3);
                _.each(cells, function(cell, j) {
                    expect($(cell)).toContainText("val" + (j+1) + "." + (i+1));
                })
            });
        });
    });
});
