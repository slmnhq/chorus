describe("chorus.pages.HdfsShowFileView", function() {
    beforeEach(function() {
        this.file = fixtures.hdfsFile({ path: "myFile.txt", content: "My secret content" });
        this.view = new chorus.views.HdfsShowFileView({ model: this.file });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("shows the text in a textfield", function() {
            expect(this.view.$("textarea.hdfs_file_content")).toContainText("My secret content")
        })

        it("is read-only", function() {
            expect(this.view.$("textarea.hdfs_file_content").attr("disabled")).toBe("disabled")
        })
    })
})