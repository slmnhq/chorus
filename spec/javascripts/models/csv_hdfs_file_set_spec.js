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

    describe("#hdfsEntryTextFiles", function () {
        it("returns only text files", function() {
            expect(this.collection.hdfsEntryTextFiles().length).toBe(1);
        });
    });
});