describe("chorus.views.TabularDataList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([
            newFixtures.dataset.chorusView({ hasCredentials: true }),
            newFixtures.dataset.sandboxTable({ hasCredentials: true })
        ]);
        this.collection.loaded = true;
        this.view = new chorus.views.TabularDataList({ collection: this.collection, activeWorkspace: true });
        this.view.render();
    });

    it("renders a dataset view for each dataset", function() {
        expect(this.view.$("> li").length).toBe(this.collection.length);
    });

    it("should broadcast tabularData:selected when itemSelected is called", function() {
        var model = this.collection.at(1);
        spyOn(chorus.PageEvents, "broadcast");
        this.view.itemSelected(model);
        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("tabularData:selected", model);
    });

    it("pre-selects the first item by default", function() {
        expect(this.view.$("li").eq(0)).toHaveClass("selected");
    });

    it("passes the 'activeWorkspace' option to the dataset views, so that they render the links", function() {
        expect(this.view.$("li a.image").length).toBe(2);
        expect(this.view.$("li a.name").length).toBe(2);

        this.view = new chorus.views.TabularDataList({ collection: this.collection, activeWorkspace: false });
        this.view.render();

        expect(this.view.$("li a.image").length).toBe(0);
        expect(this.view.$("li a.name").length).toBe(0);
    });
});
