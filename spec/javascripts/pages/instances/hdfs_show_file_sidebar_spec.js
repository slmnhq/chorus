describe("chorus.views.HdfsShowFileSidebar", function() {
    beforeEach(function() {
        var now = Date.parse('yesterday').toISOString().toString();
        var now_utc = now.slice(0,10) + " " + now.slice(12)

        this.file = fixtures.hdfsFile({
            path: "folder%2Ffilename.txt",
            instanceId: 9876,
            lastModificationTime: now_utc
        })
        this.view = new chorus.views.HdfsShowFileSidebar({ model: this.file })
    });

    describe("#setup", function() {
        it("fetches the ActivitySet for the hdfs file", function() {
            expect(this.server.requests[0].url).toContain("/edc/activitystream/hdfs/" + this.view.makeEncodedEntityId());
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
            expect(this.view.$("a.dialog").data("entity-id")).toBe("9876%7Cfolder%2Ffilename.txt");
            expect(this.view.$("a.dialog").data("entity-type")).toBe("hdfs");
        })

        it("has an activity list", function() {
            expect(this.view.$(".activity_list")).toExist()
        });

        it("should have an activities tab", function() {
            expect(this.view.$('.tabbed_area .activity_list')).toExist();
        });
    });

    describe("when the activity list collection is changed", function() {
        beforeEach(function() {
            spyOn(this.view, "postRender"); // check for #postRender because #render is bound
            this.view.activityList.collection.trigger("changed")
        })

        it("re-renders", function() {
            expect(this.view.postRender).toHaveBeenCalled();
        })
    });

    describe("#makeEncodedEntityId", function() {
        it("encodes the string correctly", function() {
            expect(this.view.makeEncodedEntityId()).toBe("9876%7Cfolder%2Ffilename.txt")
        })
    })
})