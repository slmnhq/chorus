describe("chorus.views.DatasetList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([
            fixtures.datasetChorusView({ hasCredentials: true }),
            fixtures.datasetSandboxTable({ hasCredentials: true })
        ]);
        this.collection.loaded = true;
        this.view = new chorus.views.DatasetList({ collection: this.collection, activeWorkspace: true });
        this.view.render();
    });

    it("renders a dataset view for each dataset", function() {
        expect(this.view.$("> li").length).toBe(this.collection.length);
    });

    it("should broadcast tabularData:selected when itemSelected is called", function() {
        var model = this.collection.at(2);
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

        this.view = new chorus.views.DatasetList({ collection: this.collection, activeWorkspace: false });
        this.view.render();

        expect(this.view.$("li a.image").length).toBe(0);
        expect(this.view.$("li a.name").length).toBe(0);
    });
});
