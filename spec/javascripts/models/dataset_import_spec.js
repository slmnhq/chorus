describe("chorus.models.DatasetImport", function() {
    beforeEach(function() {
        this.model = fixtures.datasetImport({
            workspaceId: '101',
            datasetId: '102|my_db_name|my_schema_name|SOURCE_TABLE|my_table_name'
        });
    });

    it("has the right url", function() {
        expect(this.model.url()).toHaveUrlPath("/edc/workspace/101/dataset/102|my_db_name|my_schema_name|SOURCE_TABLE|my_table_name/import");
    });

    describe("validations", function() {
        context("when creating a new table", function() {
            beforeEach(function() {
                this.attrs = {
                    tableName: "Foo",
                    rowLimit: "23"
                };
            });

            it("should require a table name", function() {
                this.attrs.tableName = "";
                expect(this.model.performValidation(this.attrs)).toBeFalsy();
            });

            context("when useLimitRows is enabled", function() {
                beforeEach(function() {
                    this.attrs.useLimitRows = true;
                });

                it("should only allow digits for the row limit", function() {
                    this.attrs.rowLimit = "a3v4s5";
                    expect(this.model.performValidation(this.attrs)).toBeFalsy();
                });
            });

            context("when useLimitRows is not enabled", function() {
                beforeEach(function() {
                    this.attrs.useLimitRows = false;
                });

                it("should not validate the rowLimit field", function() {
                    this.attrs.rowLimit = "";
                    expect(this.model.performValidation(this.attrs)).toBeTruthy();
                });
            });
        });
    });
});
