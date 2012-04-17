describe("chorus.views.DatabaseListSidebar", function() {
    beforeEach(function() {
        this.view = new chorus.views.DatabaseListSidebar();

        this.database = fixtures.database();
        chorus.PageEvents.broadcast("database:selected", this.database);
    });

    it("should display the database name", function() {
        expect(this.view.$(".name")).toContainText(this.database.get("name"));
    });

    it("displays the new name when a new database is selected", function() {
        var db = fixtures.database();
        chorus.PageEvents.broadcast("database:selected", db);
        expect(this.view.$(".name")).toContainText(db.get("name"));
    });

    it("displays the database type", function() {
        expect(this.view.$(".type")).toContainTranslation("database_list.sidebar.type");
    });

    it("displays nothing when a database is deselected", function() {
        chorus.PageEvents.broadcast("database:deselected");
        expect(this.view.$(".info")).not.toExist();
    });
});