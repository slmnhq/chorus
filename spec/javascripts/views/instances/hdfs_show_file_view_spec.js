describe("chorus.pages.HdfsShowFileView", function() {
    beforeEach(function() {
        this.file = fixtures.hdfsFile({ path: "myFile.txt", content: "My secret content" });
        this.view = new chorus.views.HdfsShowFileView({ model: this.file });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("shows the text", function() {
            expect(this.view.$(".hdfs_file_content")).toContainText("My secret content")
        })
    })
})