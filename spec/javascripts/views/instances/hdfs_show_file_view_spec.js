describe("chorus.pages.HdfsShowFileView", function() {
    beforeEach(function() {
        this.file = fixtures.hdfsFile({ path: "myFile.txt", lines: ["My secret content", "next line"] });
        this.view = new chorus.views.HdfsShowFileView({ model: this.file });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("shows the text", function() {
            expect(this.view.$(".hdfs_file_content").text()).toBe("My secret content\nnext line")
        })
    })
})