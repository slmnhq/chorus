describe("chorus.models.Table", function() {
    beforeEach(function() {
        this.table = new chorus.models.Table({name: "Tabler", instanceId: "33", databaseName: "dataman", schemaName: "partyman"});
    });

    it("should have the correct url template", function() {
        expect(this.table.url()).toBe("/edc/data/33/database/dataman/schema/partyman/table/Tabler");
    });
});
