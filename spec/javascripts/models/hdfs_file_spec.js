describe("chorus.models.HdfsFile", function() {
    beforeEach(function() {
        this.file = fixtures.hdfsFile({ instance_id: "1234", path: "/my/complicated/home/folder/my file.txt" });
    })

    it("gets the correct filename from the path", function() {
        expect(this.file.fileNameFromPath()).toBe("my file.txt")
    })

    it("gets the correct image url for the file type", function() {
        expect(this.file.iconUrl()).toBe("/images/workfiles/large/txt.png")
    })

    it("has the right url", function() {
        expect(this.file.url()).toBe("/data/1234/hdfs/%2Fmy%2Fcomplicated%2Fhome%2Ffolder%2Fmy%20file.txt/sample");
    });
})
