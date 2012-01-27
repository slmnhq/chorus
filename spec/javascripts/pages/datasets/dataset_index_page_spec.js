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

            this.dataset = fixtures.datasetSourceTable();
            var listView = this.page.mainContent.content;
            spyOnEvent(this.page.sidebar, 'dataset:selected');
            listView.trigger("dataset:selected", this.dataset);
        })

        it("triggers the event on the sidebar view", function() {
            expect('dataset:selected').toHaveBeenTriggeredOn(this.page.sidebar, [ this.dataset ]);
        });

        it("sets the selected dataset as its own model", function() {
            expect(this.page.model).toBe(this.dataset);
        });
    });
});
