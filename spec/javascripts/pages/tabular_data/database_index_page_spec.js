describe("chorus.pages.DatabaseIndexPage", function() {
    beforeEach(function() {
        this.instance = rspecFixtures.greenplumInstance({id: "1234", name: "instance Name"});
        this.page = new chorus.pages.DatabaseIndexPage("1234");
        this.page.render();
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("instances")
    });

    it("fetches the instance", function() {
        expect(this.page.instance).toHaveBeenFetched();
    });

    it("fetches the databases for that instance", function() {
        expect(this.page.collection).toHaveBeenFetched();
    });

    it("has the right #failurePageOptions (for populating the content of a 404 page)", function() {
        var options = this.page.failurePageOptions();
        expect(options.title).toMatchTranslation("invalid_route.database_index.title");
        expect(options.text).toMatchTranslation("invalid_route.database_index.content");
    });

    describe("before the fetches complete", function() {
        it("has some breadcrumbs", function() {
            expect(this.page.$(".breadcrumbs")).toContainTranslation("breadcrumbs.home")
        });

        it("displays a loading section", function() {
            expect(this.page.$(".loading_section")).toExist();
        });
    });

    describe("when all of the fetches complete", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchFor(this.page.collection, [fixtures.database({name: "bar"}), fixtures.database({name: "foo"})]);
        });

        it("should have title in the mainContentList", function() {
            expect(this.page.mainContent.contentHeader.$("h1")).toContainText(this.instance.get("name"));
        });

        it("should have the correct instance icon in the header ", function() {
            expect(this.page.mainContent.contentHeader.$("img")).toHaveAttr("src", this.instance.providerIconUrl());
        });

        it("should have the correct breadcrumbs", function() {
            expect(this.page.$(".breadcrumb").length).toBe(3);

            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)")).toContainTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)")).toContainTranslation("breadcrumbs.instances");

            expect(this.page.$(".breadcrumb:eq(2)")).toContainText(this.instance.get("name"));
        });

        it("should have set up search correctly", function() {
            expect(this.page.$(".list_content_details .count")).toContainTranslation("entity.name.Database", {count: 2});
            expect(this.page.$("input.search")).toHaveAttr("placeholder", t("database.search_placeholder"));
            expect(this.page.$(".list_content_details .explore")).toContainTranslation("actions.explore");

            this.page.$("input.search").val("bar").trigger("keyup");

            expect(this.page.$("li.database:eq(1)")).toHaveClass("hidden");
            expect(this.page.$(".list_content_details .count")).toContainTranslation("entity.name.Database", {count: 1});
        });

        it("has a sidebar", function() {
            expect(this.page.sidebar).toBeA(chorus.views.DatabaseListSidebar);
            expect(this.page.$(this.page.sidebar.el)).toExist();
        })
    });
});
