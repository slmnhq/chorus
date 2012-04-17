describe("chorus.views.SchemaListSidebar", function() {
    beforeEach(function() {
        this.view = new chorus.views.SchemaListSidebar();

        this.schema = fixtures.schema();
        chorus.PageEvents.broadcast("schema:selected", this.schema);
    });

    it("should display the schema name", function() {
        expect(this.view.$(".name")).toContainText(this.schema.get("name"));
    });

    it("displays the new name when a new schema is selected", function() {
        var schema = fixtures.schema();
        chorus.PageEvents.broadcast("schema:selected", schema);
        expect(this.view.$(".name")).toContainText(schema.get("name"));
    })

    it("displays the schema type", function() {
        expect(this.view.$(".type")).toContainTranslation("schema_list.sidebar.type");
    });

    it("displays nothing when a schema is deselected", function() {
        chorus.PageEvents.broadcast("schema:deselected");
        expect(this.view.$(".info")).not.toExist();
    });
});