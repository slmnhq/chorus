describe("chorus.dialogs.CreateDirectoryExternalTableFromHdfs", function() {
    beforeEach(function() {

        this.collection = fixtures.csvHdfsFileSet().filesOnly();
        this.dialog = new chorus.dialogs.CreateDirectoryExternalTableFromHdfs({
            workspaceId: "22",
            directoryName: "test",
            collection: this.collection
        });

        this.csv = new chorus.models.CsvHdfs({lines: [
            "COL1,col2, col3 ,col 4,Col_5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5"
        ],
            instanceId: "234",
            path: "/foo/bar.txt"
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
                this.dialog.collection.attributes.path = "/";
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

        describe("changing the file", function () {
            beforeEach(function() {
                var selElement = this.dialog.$("select").val(this.collection.at(1).get("name"))
                selElement.change();
            });
            it("should fetch the new sample", function() {
                expect(this.server.lastFetch().url).toBe("/edc/data/"+this.collection.at(1).get("instanceId")+"/hdfs/"+
                    encodeURIComponent(this.collection.at(1).get("path")) + "/sample")
            });
            it("display spinner", function() {
                expect(this.dialog.$(".data_table").isLoading()).toBeTruthy();

            })
            context("when the fetch completes", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.dialog.csv, this.csv);
                });

                it("stops the spinner", function() {
                    expect(this.dialog.$(".data_table").isLoading()).toBeFalsy();
                });
                it("display the correct toTable name", function() {
                    expect(this.dialog.$("input[name=toTable]").val()).toBe("test")
                });
            });
        });
    });
});
