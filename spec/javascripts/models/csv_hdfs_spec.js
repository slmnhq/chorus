describe("chorus.models.CsvHdfs", function() {
    it("has the right url", function() {
        this.model = new chorus.models.CsvHdfs(fixtures.csvImport({instanceId: "23", path: "/foo/bar.txt"}).attributes);
        expect(this.model.url()).toBe("/data/23/hdfs/%2Ffoo%2Fbar.txt/sample");
    })
});