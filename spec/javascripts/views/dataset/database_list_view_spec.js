describe("chorus.views.DatabaseList", function() {
    beforeEach(function() {
        this.database1 = rspecFixtures.database();
        this.database2 = rspecFixtures.database();
        this.collection = new chorus.collections.DatabaseSet([], {instanceId: 456});
        this.collection.reset([this.database1, this.database2]);

        this.view = new chorus.views.DatabaseList({collection: this.collection});
        this.view.render();
    });

    it("displays a loading section before the collection has loaded", function() {
        expect(this.view.$(".loading_section")).toExist();
    });

    context("when the collection is loaded", function() {
        beforeEach(function() {
            this.collection.loaded = true;
            this.collection.trigger("reset");
        });

        it("hides a loading section", function() {
            expect(this.view.$(".loading_section")).not.toExist();
        });

        it("should render an li for each item in the collection", function() {
            expect(this.view.$("li.database").length).toBe(2);
        });

        it("displays each databases name with a link to the database", function() {
            expect(this.view.$("li.database a.name").eq(0)).toContainText(this.database1.get("name"));
            expect(this.view.$("li.database a.name").eq(0)).toHaveHref(this.database1.showUrl());

            expect(this.view.$("li.database a.name").eq(1)).toContainText(this.database2.get("name"));
            expect(this.view.$("li.database a.name").eq(1)).toHaveHref(this.database2.showUrl());
        });

        it("displays the right icon for each database", function() {
            expect(this.view.$("li.database img").eq(0)).toHaveAttr("src", "/images/instances/greenplum_database.png");
        });

        it("should broadcast a database:selected event when itemSelected is called", function() {
            spyOn(chorus.PageEvents, "broadcast");
            this.view.itemSelected(this.database2);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("database:selected", this.database2);
        });
    });
});