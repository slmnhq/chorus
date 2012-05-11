describe("chorus.dialogs.CreateDirectoryExternalTableFromHdfs", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.CsvHdfsFileSet(
                [fixtures.hdfsEntryFileJson(), fixtures.hdfsEntryFileJson()],
                {instance: {id: "1234"}, path: "/abc"});
        this.dialog = new chorus.dialogs.CreateDirectoryExternalTableFromHdfs({
            workspaceId: "22",
            directoryName: "test",
            collection: this.collection
        });
    });

    describe("#render", function () {
        beforeEach(function() {
            this.dialog.render();
        });

        it("populates the table name with the directory name", function() {
            expect(this.dialog.$("input[name=toTable]").val()).toBe("test")
        });
    });
});
