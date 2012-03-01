describe("chorus.pages.HdfsDirectoryEntryIndexPage", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({id: "1234", name: "instance Name"});
        this.page = new chorus.pages.HdfsDirectoryEntryIndexPage("1234", "foo");
    });

    it("fetches the Hdfs entries for that directory", function() {
        expect(this.page.collection).toHaveBeenFetched();
    });

    it("fetches the instance", function() {
        expect(this.page.instance).toHaveBeenFetched();
    });

    describe("when all of the fetches complete", function() {
        beforeEach(function() {
            var entries = fixtures.hdfsDirectoryEntrySet(null, {instanceId: "1234", path: "/foo"});
            entries.loaded = true;
            this.server.completeFetchFor(this.page.collection, entries);
            this.page.collection = entries;
            this.server.completeFetchFor(this.page.instance, this.instance);
        });

        it("should have title in the mainContentList", function() {
            expect(this.page.mainContent.contentHeader.options.title).toBe(this.instance.get("name") + ": /foo");
        });

        it("should have the right breadcrumbs", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toMatchTranslation("breadcrumbs.instances");

            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe(this.instance.get("name"));

            expect(this.page.$(".breadcrumb").length).toBe(3);
        });

        it("should have a sidebar", function() {
            expect($(this.page.el).find(this.page.sidebar.el)).toExist();
            expect(this.page.sidebar).toBeA(chorus.views.HdfsDirectoryEntrySidebar);
        })
    })
})