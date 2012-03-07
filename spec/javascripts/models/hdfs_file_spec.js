describe("chorus.models.HdfsFile", function() {
    beforeEach(function() {
        this.file = fixtures.hdfsFile({ path: "%2Fmy%2Fcomplicated%2Fhome%2Ffolder%2FmyFile.txt" });
    })

    it("gets the correct filename from the path", function() {
        expect(this.file.fileNameFromPath()).toBe("myFile.txt")
    })

    it("gets the correct image url for the file type", function() {
        expect(this.file.iconUrl()).toBe("/images/workfiles/large/txt.png")
    })
})