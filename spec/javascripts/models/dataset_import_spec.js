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
});
