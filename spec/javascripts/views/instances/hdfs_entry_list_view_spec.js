describe("chorus.views.HdfsEntryList", function() {
    beforeEach(function() {
        this.collection = fixtures.hdfsEntrySet(null, {instance: {id: "1234"}, path: "/abc"});
        this.view = new chorus.views.HdfsEntryList({ collection : this.collection});
    });
    describe("#render", function() {
        beforeEach(function() {
            spyOn(chorus.PageEvents, "broadcast");
            this.view.render();
        });

        it("should render li for each item", function() {
            expect(this.view.$("li").length).toBe(this.collection.length);
        });

        it("renders the name for each item", function() {
            expect(this.view.$("li:eq(0) .name")).toContainText(this.collection.at(0).get("name"));
            expect(this.view.$("li:eq(1) .name")).toContainText(this.collection.at(1).get("name"));
        })

        it("renders the size for the file", function() {
            expect(this.view.$("li:eq(1) .size")).toContainText(I18n.toHumanSize(this.collection.at(1).get("size")));
        });

        it("renders the icon for each item", function() {
            expect(this.view.$("li:eq(0) img")).toExist();
            expect(this.view.$("li:eq(1) img")).toExist();
        })

        it("pre-selects the first item", function() {
            expect(this.view.$("li:eq(0)")).toHaveClass("selected");
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("hdfs_entry:selected", this.collection.at(0));
        })

        it("links the directory name to that browse page", function() {
            expect(this.view.$("li:eq(0) a.name").attr("href")).toBe("#/instances/1234/browse/abc/" + this.collection.at(0).get("name"));
        })

        it("shows 'Directory - x files' in the subtitle line for the directory", function() {
            expect(this.view.$("li:eq(0) .dir")).toContainTranslation("hdfs.directory_files", {count: this.collection.at(0).get("count")})
        })


        describe("when browsing the root directory", function() {
            beforeEach(function() {
                this.collection.attributes.path = "/";
                this.collection.reset(this.collection.models);
                this.view.render();
            });

            it("links the directory name to that browse page", function() {
                expect(this.view.$("li:eq(0) a.name").attr("href")).toBe("#/instances/1234/browse/" + this.collection.at(0).get("name"));
            })
        })

        describe("clicking on an li", function() {
            beforeEach(function() {
                this.view.$("li:eq(1)").click();
            });

            it("broadcasts hdfs_entry:selected", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("hdfs_entry:selected", this.collection.at(1));
            })

            it("adds the selected class to only that item", function() {
                expect(this.view.$("li:eq(1)")).toHaveClass("selected");
                expect(this.view.$("li:eq(0)")).not.toHaveClass("selected");
            })
        })
    });
});