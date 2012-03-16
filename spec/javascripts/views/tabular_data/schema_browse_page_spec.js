describe("chorus.pages.SchemaBrowsePage", function() {
    beforeEach(function() {
        this.schema = fixtures.schema();
        this.instance = fixtures.instance({id: this.schema.get("instanceId")});
        this.database = fixtures.database({name: this.schema.get("databaseName"), instanceId: this.instance.get("id")});
        this.page = new chorus.pages.SchemaBrowsePage(this.schema.get("instanceId"), this.schema.get("databaseName"), this.schema.get("name"));
    })

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("schema")
    })

    it("includes the InstanceCredentials mixin", function() {
        expect(this.page.requiredResourcesFetchFailed).toBe(chorus.Mixins.InstanceCredentials.page.requiredResourcesFetchFailed);
    });

    context("after everything has been fetched", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchFor(this.page.collection, [
                fixtures.databaseTable(),
                fixtures.databaseView()
            ]);
        });

        it("sets the instanceName on the schema", function() {
            expect(this.page.schema.get("instanceName")).toBe(this.instance.get("name"));
        });

        it("pre-selects the first item", function() {
            expect(this.page.$(".dataset_list li").eq(0)).toHaveClass("selected");
        });

        it("changes the selection after clicking another item", function() {
            this.page.$(".dataset_list li").eq(1).click();

            expect(this.page.$(".dataset_list li").eq(0)).not.toHaveClass("selected");
            expect(this.page.$(".dataset_list li").eq(1)).toHaveClass("selected");
        });

        it("has the right breadcrumbs", function() {
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0)).toHaveHref("#/");
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(0)).toContainTranslation("breadcrumbs.home");

            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1)).toHaveHref("#/instances");
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(1)).toContainTranslation("breadcrumbs.instances");

            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toContainText(this.instance.get("name"));
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(2)).toHaveHref(this.instance.showUrl());

            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toContainText(this.database.get("name"));
            expect(this.page.$("#breadcrumbs .breadcrumb a").eq(3)).toHaveHref(this.database.showUrl());

            expect(this.page.$("#breadcrumbs .breadcrumb .slug").text()).toBe(this.page.schema.get("name"));
        });

        it("has the right title", function() {
            expect(this.page.$(".content_header h1").text()).toBe(this.page.schema.canonicalName());
        });

        it("constructs the main content list correctly", function() {
            expect(this.page.mainContent).toBeA(chorus.views.MainContentList);
            expect(this.page.mainContent.collection).toBe(this.page.collection);
            expect(this.page.mainContent.collection).toBeA(chorus.collections.DatabaseObjectSet);

            expect(this.page.$(this.page.mainContent.el).length).toBe(1);
        });

        it("creates the collection with the right options", function() {
            expect(this.page.collection.attributes.instanceId).toBe(this.schema.get("instanceId"))
            expect(this.page.collection.attributes.databaseName).toBe(this.schema.get("databaseName"))
            expect(this.page.collection.attributes.schemaName).toBe(this.schema.get("name"))
        })
    });
});
