describe("chorus.views.HdfsDirectoryEntrySidebar", function(){
    beforeEach(function() {
        this.hdfsEntry = fixtures.hdfsDirectoryEntryDir();
        this.view = new chorus.views.HdfsDirectoryEntrySidebar();
        chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
    });

    describe("#render", function() {

        it("should display the file name", function() {
            expect(this.view.$(".info .name").text()).toBe(this.hdfsEntry.get("name"));
        });

        it("should display the last updated timestamp", function() {
            expect(this.view.$(".info .last_updated").text()).toBe(chorus.helpers.relativeTimestamp(this.hdfsEntry.get("lastModified")));
        });

    })
})