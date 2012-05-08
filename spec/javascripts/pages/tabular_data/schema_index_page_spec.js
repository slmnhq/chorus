describe("chorus.pages.SchemaIndexPage", function() {
    beforeEach(function() {
        this.instance = newFixtures.instance.greenplum({id: "1234"});
        this.page = new chorus.pages.SchemaIndexPage("1234", "Foo/");
        this.page.render();
    });

    it("includes the InstanceCredentials mixin", function() {
        expect(this.page.requiredResourcesFetchForbidden).toBe(chorus.Mixins.InstanceCredentials.page.requiredResourcesFetchForbidden);
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("instances")
    });

    it("fetches the instance", function() {
        expect(this.page.instance).toHaveBeenFetched();
    });

    it("fetches the schema set with the right instance id and database name", function() {
        expect(this.page.collection.attributes.databaseName).toBe("Foo/");
        expect(this.page.collection.attributes.instance_id).toBe("1234");
        expect(this.page.collection).toHaveBeenFetched();
    });

    describe("before the fetches complete", function() {
        it("has some breadcrumbs", function() {
            expect(this.page.$(".breadcrumbs")).toContainTranslation("breadcrumbs.home")
        });
    });

    describe("when all of the fetches complete", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchFor(this.page.collection, [
                fixtures.schema({name: "bar"}), fixtures.schema({name: "foo"})
            ]);
        });

        it("should have title in the mainContentList", function() {
            expect(this.page.mainContent.contentHeader.$("h1")).toContainText("Foo");
        });

        it("should have the correct instance icon in the header ", function() {
            expect(this.page.mainContent.contentHeader.$("img")).toHaveAttr("src", "/images/instances/greenplum_database.png");
        });

        it("should have set up search correctly", function() {
            expect(this.page.$(".list_content_details .count")).toContainTranslation("entity.name.Schema", {count: 2});
            expect(this.page.$("input.search")).toHaveAttr("placeholder", t("schema.search_placeholder"));
            expect(this.page.$(".list_content_details .explore")).toContainTranslation("actions.explore");

            this.page.$("input.search").val("bar").trigger("keyup");

            expect(this.page.$("li.schema:eq(1)")).toHaveClass("hidden");
            expect(this.page.$(".list_content_details .count")).toContainTranslation("entity.name.Schema", {count: 1});
            expect(this.page.mainContent.options.search.eventName).toBe("schema:search");
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
