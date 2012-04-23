describe("chorus.views.WorkspaceShow", function() {
    beforeEach(function() {
        this.model = new chorus.models.Workspace({ id : 4 });
        this.model.fetch();
        this.view = new chorus.views.WorkspaceShow({ model : this.model });
        this.view.render();
    });

    describe("#render", function() {
        context("before the model is fetched", function() {
            it("shows a loading message", function() {
                expect(this.view.$(".loading_section")).toExist();
            });
        });

        it("fetches the workspace's activities", function() {
            expect(this.model.activities()).toHaveBeenFetched();
        });

        describe("after the model and its activities are fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.model);
                this.server.completeFetchFor(this.model.activities());
            });

            it("renders the activity list", function() {
                expect(this.view.$(".activity_list").length).toBe(1);
            });
        });
    })
})
