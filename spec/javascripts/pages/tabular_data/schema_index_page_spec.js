describe("chorus.pages.SchemaIndexPage", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({id: "1234"});
        this.page = new chorus.pages.SchemaIndexPage("1234", "Foo");
        this.page.render();
    });

    it("includes the InstanceCredentials mixin", function() {
        expect(this.page.requiredResourcesFetchFailed).toBe(chorus.Mixins.InstanceCredentials.page.requiredResourcesFetchFailed);
    });

    it("fetches the instance", function() {
        expect(this.page.instance).toHaveBeenFetched();
    });

    it("fetches the schemas for the database", function() {
        expect(this.page.collection).toHaveBeenFetched();
    });

    describe("when all of the fetches complete", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchAllFor(this.page.collection, [
                fixtures.schema(), fixtures.schema()
            ]);
        });

        it("should have title in the mainContentList", function() {
            expect(this.page.mainContent.contentHeader.$("h1")).toContainText("Foo");
        });

        it("should have the correct instance icon in the header ", function() {
            expect(this.page.mainContent.contentHeader.$("img")).toHaveAttr("src", "/images/instances/greenplum_database.png");
        });

        it("should have the correct breadcrumbs", function() {
            expect(this.page.$(".breadcrumb").length).toBe(4);

            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)")).toContainTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)")).toContainTranslation("breadcrumbs.instances");

            expect(this.page.$(".breadcrumb:eq(2) a").attr("href")).toBe(this.instance.showUrl());
            expect(this.page.$(".breadcrumb:eq(2)")).toContainText(this.instance.get("name"));

            expect(this.page.$(".breadcrumb:eq(3)")).toContainText("Foo");
        });

        it("has a sidebar", function() {
            expect(this.page.sidebar).toBeA(chorus.views.SchemaListSidebar);
            expect(this.page.$(this.page.sidebar.el)).toExist();
        })
    })
})
