describe("chorus.models.HdfsDirectoryEntry", function() {
    it("has the right entityType", function() {
        this.model = fixtures.hdfsDirectoryEntryFile();
        expect(this.model.entityType).toBe("hdfs");
    });
});