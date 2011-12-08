describe("chorus.views.DashboardWorkspaceList", function() {
    beforeEach(function(){
        this.loadTemplate("dashboard_workspace_list");
        this.workspace = new chorus.models.Workspace({id: 1, name: "first workspace", active: true});

        this.collection = new chorus.models.WorkspaceSet([this.workspace]);

        this.view = new chorus.views.DashboardWorkspaceList({collection : this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("displays the name of the workspace", function() {
            expect(this.view.$(".name span").text()).toBe("first workspace");
        });
        it("displays the default icon for the workspace", function() {
            expect(this.view.$(".image img").attr("src")).toBe(this.workspace.defaultIconUrl());
        });
        it("links to the workspace page", function() {
            expect(this.view.$(".image").attr("href")).toBe(this.workspace.showUrl());
        });
    });

});