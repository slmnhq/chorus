describe("chorus.views.DatabaseList", function() {
    beforeEach(function() {
        this.database1 = fixtures.database();
        this.database2 = fixtures.database();
        this.collection = new chorus.collections.DatabaseSet([], {instanceId: 456});
        this.collection.reset([this.database1, this.database2]);

        this.view = new chorus.views.DatabaseList({collection: this.collection});
        this.view.render();
    });

    it("should render an li for each item in the collection", function() {
        expect(this.view.$("li.database").length).toBe(2);
    });

    it("displays each databases name with a link to the database", function() {
        expect(this.view.$("li.database a.name").eq(0)).toContainText(this.database1.get("name"));
        expect(this.view.$("li.database a.name").eq(0)).toHaveHref(this.database1.showUrl());

        expect(this.view.$("li.database a.name").eq(1)).toContainText(this.database2.get("name"));
        expect(this.view.$("li.database a.name").eq(1)).toHaveHref(this.database2.showUrl());
    })

    it("displays the right icon for each database", function() {
        expect(this.view.$("li.database img").eq(0)).toHaveAttr("src", "/images/instances/greenplum_database.png")
    })

    it("preselects the first item", function() {
        expect(this.view.$("li.database").eq(0)).toHaveClass("selected");
    })

    describe("clicking another entry", function() {
        beforeEach(function() {
            spyOn(chorus.PageEvents, "broadcast");
            this.view.$("li.database").eq(1).click();
        });

        it("selects only that entry", function() {
            expect(this.view.$("li.database").eq(0)).not.toHaveClass("selected");
            expect(this.view.$("li.database").eq(1)).toHaveClass("selected");
        })

        it("should broadcast a database:selected event with the selected item", function() {
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("database:selected", this.database2);
        });
    })
});