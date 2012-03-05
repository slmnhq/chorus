describe("chorus.views.HdfsDirectoryEntrySidebar", function(){
    beforeEach(function() {
        this.view = new chorus.views.HdfsDirectoryEntrySidebar({rootPath: "/foo", instanceId: 123});
    });

    describe("#render", function() {
        context("when the model is a directory", function() {
            beforeEach(function() {
                this.hdfsEntry = fixtures.hdfsDirectoryEntryDir();
                chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
            });

            itDisplaysTheRightNameAndTimestamp();

            it("does not have a link to add a note", function() {
                expect(this.view.$("a.dialog.add_note")).not.toExist();
            });
        });

        context("when the model is a file", function() {
            beforeEach(function() {
                this.hdfsEntry = fixtures.hdfsDirectoryEntryFile();
                chorus.PageEvents.broadcast("hdfs_entry:selected", this.hdfsEntry);
            });

            itDisplaysTheRightNameAndTimestamp();

            it("has a link to add a note", function() {
                var $link = this.view.$("a.dialog.add_note");
                expect($link.data("dialog")).toBe("NotesNew");
                expect($link.data("entityType")).toBe("hdfs");
                expect($link.data("entityId")).toBe("123|%2Ffoo%2F" + encodeURIComponent(this.hdfsEntry.get("name")));
                expect($link.data("allowWorkspaceAttachments")).toBeFalsy();
                expect($link.data("displayEntityType")).toMatchTranslation("hdfs.file_lower");
                expect($link.text()).toMatchTranslation("actions.add_note");
            });
        });
    })

    function itDisplaysTheRightNameAndTimestamp() {
        it("should display the file name", function() {
            expect(this.view.$(".info .name").text()).toBe(this.hdfsEntry.get("name"));
        });

        it("should display the last updated timestamp", function() {
            var when = chorus.helpers.relativeTimestamp(this.hdfsEntry.get("lastModified"));
            expect(this.view.$(".info .last_updated").text().trim()).toMatchTranslation("hdfs.last_updated", {when: when});
        });
    }
})