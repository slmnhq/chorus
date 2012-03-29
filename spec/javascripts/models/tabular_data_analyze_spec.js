describe("chorus.models.TabularDataAnalyze", function() {
    beforeEach(function() {
        this.analyze = new chorus.models.TabularDataAnalyze({
            instanceId: "1",
            databaseName: "foo",
            schemaName: "bar",
            objectName: "baz",
            metaType: "table"
        });
    })

    it("should have the correct url template", function() {
        expect(this.analyze.url()).toContain("/edc/data/1/database/foo/schema/bar/table/baz/analyze");
    });
});