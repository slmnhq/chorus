describe("chorus.views.WorkspaceDetail", function() {
    beforeEach(function() {
        fixtures.model = "Workspace";
        this.loadTemplate("workspace_detail");
        this.loadTemplate("main_activity_list");
        this.model = new chorus.models.Workspace({ id : 4 });
        this.view = new chorus.views.WorkspaceDetail({ model : this.model });
        this.view.render();
    })

    describe("#render", function() {
        context("before the model is fetched", function() {
            it("shows a loading message", function() {
                expect(this.view.$(".loading")).toExist();
            })
        })

        context("after the model is fetched", function() {
            beforeEach(function() {
                this.view = new chorus.views.WorkspaceDetail({ model : fixtures.modelFor("fetch")});
                this.view.render();
            })

            it("renders the activity list", function() {
                expect(this.view.$(".activities.main_activity_list").length).toBe(1);
            })
        })
    })
})
