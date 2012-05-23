describe("chorus.views.SchemaList", function() {
    beforeEach(function() {
        this.schema1 = fixtures.schema();
        this.schema2 = fixtures.schema({datasetCount: 1});
        this.collection = new chorus.collections.SchemaSet([], {databaseId: 456});
        this.collection.reset([this.schema1, this.schema2]);

        this.view = new chorus.views.SchemaList({collection: this.collection});
        this.view.render();
    });

    it("should render an li for each item in the collection", function() {
        expect(this.view.$("li.schema").length).toBe(2);
    });

    it("displays each schema's name with a link to the schema", function() {
        expect(this.view.$("li.schema a.name").eq(0)).toContainText(this.schema1.get("name"));
        expect(this.view.$("li.schema a.name").eq(0)).toHaveHref(this.schema1.showUrl());

        expect(this.view.$("li.schema a.name").eq(1)).toContainText(this.schema2.get("name"));
        expect(this.view.$("li.schema a.name").eq(1)).toHaveHref(this.schema2.showUrl());
    })

    it("displays the right icon for each schema", function() {
        expect(this.view.$("li.schema img").eq(0)).toHaveAttr("src", "/images/instances/greenplum_schema.png")
    })

    it("displays the dataset count for each schema", function() {
        expect(this.view.$("li.schema .description").eq(0)).toContainTranslation("entity.name.Dataset", {count: this.schema1.get("datasetCount")});
        expect(this.view.$("li.schema .description").eq(1)).toContainTranslation("entity.name.Dataset", {count: 1});
    })

    it("should broadcast a schema:selected event when itemSelected is called", function() {
        spyOn(chorus.PageEvents, "broadcast");
        this.view.itemSelected(this.schema2);
        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("schema:selected", this.schema2);
    });
});