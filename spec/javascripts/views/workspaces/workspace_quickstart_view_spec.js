describe("chorus.views.WorkspaceQuickstart", function() {
    beforeEach(function() {
        this.model = fixtures.workspace();
        this.model.loaded = true;
        this.view = new chorus.views.WorkspaceQuickstart({model: this.model});
        this.view.render();
    });

    it("has the right headline text", function() {
        expect(this.view.$("h2")).toContainTranslation("workspace.quickstart.headline");
    });

    it("has the right body text", function() {
        expect(this.view.$(".body")).toContainTranslation("workspace.quickstart.body");
    });

    describe("the 'Add Team Members' section", function() {
        it("has a link", function() {
            expect(this.view.$(".add_team_members a")).toContainTranslation("workspace.quickstart.add_team_members.link");
        });

        it("has an image", function() {
            expect(this.view.$(".add_team_members img")).toHaveAttr("src", "images/workspaces/user_quick_start.png");
        });

        it("has a description", function() {
            expect(this.view.$(".add_team_members .text")).toContainTranslation("workspace.quickstart.add_team_members.text");
        });
    });

    describe("the 'Edit Workspace Settings' section", function() {
        it("has a link", function() {
            expect(this.view.$(".edit_workspace_settings a")).toContainTranslation("workspace.quickstart.edit_workspace_settings.link");
        });

        it("has an image", function() {
            expect(this.view.$(".edit_workspace_settings img")).toHaveAttr("src", "images/workspaces/config_quick_start.png");
        });

        it("has a description", function() {
            expect(this.view.$(".edit_workspace_settings .text")).toContainTranslation("workspace.quickstart.edit_workspace_settings.text");
        });
    });
});