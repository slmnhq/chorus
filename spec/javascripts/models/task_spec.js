describe("chorus.models.Task", function() {
    beforeEach(function() {
        this.model = fixtures.task({
            id: 1,
            instanceId: '5',
            databaseId: '6',
            schemaId: '7',
            sql: "show tables"
        });
    });

    it("has the right url", function() {
        var expectedUrl = "/edc/task/sync/";
        expect(this.model.url()).toMatchUrl(expectedUrl);
    });

    it("has the taskType of workfileSQLExecution by default", function(){
       expect(this.model.get("taskType")).toBe("workfileSQLExecution");
    })
});
