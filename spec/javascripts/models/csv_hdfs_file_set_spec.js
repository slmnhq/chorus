describe("chorus.collections.CsvHdfsFileSet", function () {
    beforeEach(function() {
        this.collection = new chorus.collections.CsvHdfsFileSet([
            fixtures.hdfsEntryFileJson(),
            fixtures.hdfsEntryDirJson(),
            fixtures.hdfsEntryBinaryFileJson()
        ], { path: "/foo", instance: {id: 1}});
    });

    it("use the correct url", function() {
        expect(this.collection.url()).toMatchUrl("/edc/data/1/hdfs/%2Ffoo", {paramsToIgnore: ["page", "rows"]})
    });

    describe("#filesOnly", function () {
        it("returns only hdfs files", function() {
            expect(this.collection.filesOnly().length).toBe(2);
        });
    });
});