describe("chorus.pages.DatasetIndexPage", function() {
    beforeEach(function() {
        this.workspace = fixtures.workspace();
        this.page = new chorus.pages.DatasetIndexPage(this.workspace.get("id"));
    })

    describe("#initialize", function() {
        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe(this.workspace.url());
        });


    });

    describe("when the workfile:selected event is triggered on the list view", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.workspace);
            this.page.render();
        })

        it("triggers the event on the sidebar view", function() {
            this.dataset = fixtures.datasetSourceTable();
            var listView = this.page.mainContent.content;
            var sidebar = this.page.sidebar;
            var datasetSelectedSpy = jasmine.createSpy("dataset:selected");
            sidebar.bind("dataset:selected", datasetSelectedSpy);
            listView.trigger("dataset:selected", this.dataset);

            expect(datasetSelectedSpy).toHaveBeenCalledWith(this.dataset);
        });
    });
});
