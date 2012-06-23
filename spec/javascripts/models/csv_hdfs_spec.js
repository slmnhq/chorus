describe("chorus.models.CsvHdfs", function() {
    it("has the right url", function() {
        this.model = rspecFixtures.hdfsFile({"path": "/foo/bar.txt"});
        this.model.set({"hadoopInstanceId": 23})
        expect(this.model.url()).toBe("/hadoop_instances/23/contents/%2Ffoo%2Fbar.txt");
    })
});