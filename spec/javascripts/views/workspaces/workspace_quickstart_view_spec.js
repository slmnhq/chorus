describe("chorus.views.WorkspaceQuickstart", function() {
    beforeEach(function() {
        this.model = fixtures.workspace({id: "999"});
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

        it("launches the right dialog", function() {
            expect(this.view.$(".add_team_members a")).toHaveClass("dialog");
            expect(this.view.$(".add_team_members a").data("dialog")).toBe("WorkspaceEditMembers");
        });

        it("hides the box when the link is clicked", function() {
            this.view.$(".add_team_members a").click();
            expect(this.view.$(".add_team_members")).toHaveClass("hidden");
        })
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

        it("launches the right dialog", function() {
            expect(this.view.$(".edit_workspace_settings a")).toHaveClass("dialog");
            expect(this.view.$(".edit_workspace_settings a").data("dialog")).toBe("WorkspaceSettings");
        });
    });

    describe("when the 'edit workspace' dialog is launched", function() {
        beforeEach(function() {
            this.view.$(".edit_workspace_settings a").click();
        });

        it("hides the edit workspace box", function() {
            expect(this.view.$(".edit_workspace_settings")).toHaveClass("hidden");
        });

        describe("when the page re-renders", function() {
            it("still hides the box", function() {
                this.view.render();
                expect(this.view.$(".edit_workspace_settings")).toHaveClass("hidden");
            });
        });
    });

    it("navigates to the normal workspace show page if the dismiss link is clicked", function() {
        expect(this.view.$("a.dismiss")).toHaveHref("#/workspaces/999");
    });
});
