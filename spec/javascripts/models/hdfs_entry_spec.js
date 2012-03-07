describe("chorus.models.HdfsEntry", function() {
    it("has the right entityType", function() {
        this.model = fixtures.hdfsEntryFile();
        expect(this.model.entityType).toBe("hdfs");
    });
});