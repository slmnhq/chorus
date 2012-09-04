describe("chorus.models.CsvHdfs", function() {
    it("has the right url", function() {
        this.model = new chorus.models.CsvHdfs({id: 65});
        this.model.set({"hadoopInstanceId": 23})
        expect(this.model.url()).toBe("/hadoop_instances/23/files/65");
    });

    it("always posts on save", function() {
        this.model = new chorus.models.CsvHdfs({id: 65, workspaceId: 543});
        this.model.save();
        expect(this.server.lastCreate().url).toMatch("workspace/543/externaltable");
    });
});