describe("chorus.models.HdfsFile", function() {
    beforeEach(function() {
        this.file = fixtures.hdfsFile({
            hadoopInstanceId: "1234",
            path: "/my/complicated/home/folder/my file.txt",
            hadoopInstance: { id: "1234" }
        });
    })

    it("gets the correct filename from the path", function() {
        expect(this.file.fileNameFromPath()).toBe("my file.txt")
    })

    it("gets the correct image url for the file type", function() {
        expect(this.file.iconUrl()).toBe("/images/workfiles/large/txt.png")
    })

    it("has the right url", function() {
        expect(this.file.url()).toBe("/hadoop_instances/1234/contents/%2Fmy%2Fcomplicated%2Fhome%2Ffolder%2Fmy%20file.txt");
    });

    it("has the show url template", function(){
        expect(this.file.showUrlTemplate()).toBe("hadoop_instances/1234/browseFile/%2Fmy%2Fcomplicated%2Fhome%2Ffolder%2Fmy%20file.txt")
    });
})
