describe("chorus.views.WorkfileList", function() {
    beforeEach(function() {
        spyOn(chorus.PageEvents, "broadcast").andCallThrough();
    });

    context("with no workfiles in the collection", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.WorkfileSet([], {workspaceId : 1234});
            this.view = new chorus.views.WorkfileList({collection: this.collection});
            this.view.render();
        });

        it("triggers workfile:deselected", function() {
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile:deselected");
        });
    });

    context("with some workfiles in the collection", function() {
        beforeEach(function() {
            this.model1 = rspecFixtures.workfile.sql();
            this.model2 = rspecFixtures.workfile.text();
            this.model3 = rspecFixtures.workfile.binary();

            this.collection = new chorus.collections.WorkfileSet([this.model1, this.model2, this.model3], {workspaceId: 1234});
            this.view = new chorus.views.WorkfileList({collection: this.collection, activeWorkspace: true});
            this.view.render();
        });

        it("renders an li for each item in the collection", function() {
            expect(this.view.$("li").length).toBe(3);
        });

        it("pre-selects the first item in the list", function() {
            expect(this.view.$("li:first-child")).toHaveClass("selected");
        });

        it("should broadcast a workfile:selected event when itemSelected is called", function() {
            this.view.itemSelected(this.model1);
            expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("workfile:selected", this.model1);
        });
    });

    describe("#filter", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.WorkfileSet([], {workspaceId : 1234});
            this.view = new chorus.views.WorkfileList({collection: this.collection});
            spyOn(this.view.collection, "fetch");
            this.view.filter("sql");
        })

        it("should set the filter attribute", function() {
            expect(this.view.collection.attributes.type).toBe("sql")
        })

        it("should call fetch", function() {
            expect(this.view.collection.fetch).toHaveBeenCalled();
        })
    })
});
