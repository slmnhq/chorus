describe("chorus.views.HdfsShowFileSidebar", function() {
    beforeEach(function() {
        var now = new Date().addDays(-1).toString("yyyy-MM-dd HH:mm:ss.000")

        this.file = fixtures.hdfsFile({
            path: "/folder/filename.txt",
            instanceId: 9876,
            lastModificationTime: now
        })
        this.view = new chorus.views.HdfsShowFileSidebar({ model: this.file })
    });

    describe("#setup", function() {
        it("fetches the ActivitySet for the hdfs file", function() {
            expect(this.server.requests[0].url).toContain("/activitystream/hdfs/9876%7C%2Ffolder%2Ffilename.txt");
            expect(this.server.requests[0].method).toBe("GET");
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("has the right title (the filename)", function() {
            expect(this.view.$(".file_name")).toContainText("filename.txt")
        })

        it("shows the correct last_updated value", function() {
            expect(this.view.$(".last_updated")).toContainTranslation("hdfs.last_updated", { when: "1 day ago" })
        })

        it("shows the 'add a note' link", function() {
            expect(this.view.$("a.dialog").data("dialog")).toBe("NotesNew");
            expect(this.view.$("a.dialog").data("entity-id")).toBe("9876|/folder/filename.txt");
            expect(this.view.$("a.dialog").data("entity-type")).toBe("hdfs");
        })

        it("has a link to create external table", function() {
            expect(this.view.$("a.external_table")).toExist();
        })

        it("has an activity list", function() {
            expect(this.view.$(".activity_list")).toExist()
        });

        it("should have an activities tab", function() {
            expect(this.view.$('.tabbed_area .activity_list')).toExist();
        });

        describe("clicking the external table link", function() {
            beforeEach(function() {
                this.modalSpy = stubModals();
                var $linkExternalTable = this.view.$("a.external_table");
                expect($linkExternalTable).toExist();
                $linkExternalTable.click();
                this.csv = new chorus.models.CsvHdfs(fixtures.csvImport({instanceId: "9876", path: "/folder/filename.txt", content: "hello\nworld"}).attributes);
                this.server.completeFetchFor(this.csv);
            });

            it("launches the right dialog", function() {
                expect(this.modalSpy).toHaveModal(chorus.dialogs.CreateExternalTableFromHdfs)
                expect(chorus.modal.csv.get("path")).toBe("/folder/filename.txt");
            });
        });

        it("should re-render when csv_import:started is triggered", function() {
            this.server.reset();
            chorus.PageEvents.broadcast("csv_import:started");
            expect(this.server.requests[0].url).toContain("/activitystream/hdfs/9876%7C%2Ffolder%2Ffilename.txt");
            expect(this.server.requests[0].method).toBe("GET");
        });

    });

    describe("when the activity list collection is changed", function() {
        beforeEach(function() {
            spyOn(this.view, "postRender"); // check for #postRender because #render is bound
            this.view.tabs.activity.collection.trigger("changed")
        });

        it("re-renders", function() {
            expect(this.view.postRender).toHaveBeenCalled();
        })
    });
})