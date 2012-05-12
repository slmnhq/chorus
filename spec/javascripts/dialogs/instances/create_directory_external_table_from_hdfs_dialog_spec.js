describe("chorus.dialogs.CreateDirectoryExternalTableFromHdfs", function() {
    beforeEach(function() {

        this.collection = fixtures.csvHdfsFileSet().filesOnly();
        this.dialog = new chorus.dialogs.CreateDirectoryExternalTableFromHdfs({
            workspaceId: "22",
            directoryName: "test",
            collection: this.collection
        });
    });

    describe("#setup", function() {
        it("sets csv to be the first models in the collection", function() {
            expect(this.dialog.csv).toEqual(this.collection.at(0))
        });
    });

    describe("#setupCsv", function () {
        context("when the directory path is /", function() {
            beforeEach(function() {
                this.dialog.csv.set({path: "/"});
                this.dialog.setupCsv();
            });
            it("prevents an extra / from being included in the file path", function() {
                expect(this.dialog.csv.get("path")).toBe("/file2.sql");
            });

        });

        it("sets the toTable, instanceId and file path to the model", function() {
            expect(this.dialog.csv.get("toTable")).toBe("test");
            expect(this.dialog.csv.get("instanceId")).toBe("5");
            expect(this.dialog.csv.get("path")).toBe("/data/file2.sql");
        });
    });

    describe("#render", function () {
        beforeEach(function() {
            this.dialog.render();
        });

        it("populates the table name with the directory name", function() {
            expect(this.dialog.$("input[name=toTable]").val()).toBe("test")
        });

        it("populates the select sample file with hdfs text files", function() {
            expect(this.dialog.$("select option").length).toBe(3);
        })

        it("selects the all files option by default", function() {
            expect(this.dialog.$('input:radio[name=pathType]:checked').val()).toBe("directory");
        });

        it("creates a textbox for the file expression", function() {
            expect(this.dialog.$("[name=expression]")).toExist();
        });
    });
});
