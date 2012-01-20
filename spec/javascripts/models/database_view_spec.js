describe("chorus.models.DatabaseView", function() {
    beforeEach(function() {
        this.model = new chorus.models.DatabaseView({name: "View1", instanceId: "33", databaseName: "dataman", schemaName: "partyman"});
    });

    it("should have the correct url template", function() {
        expect(this.model.url()).toBe("/edc/data/33/database/dataman/schema/partyman/view/View1");
    });
});