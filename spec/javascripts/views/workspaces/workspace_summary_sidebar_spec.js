describe("chorus.views.WorkspaceSummarySidebar", function() {
    beforeEach(function() {
        this.loadTemplate("workspace_summary_sidebar");
    });

    describe("#render", function() {
        beforeEach(function() {
            this.model = new chorus.models.Workspace({name: "A Cool Workspace", id: '123'});
            this.view = new chorus.views.WorkspaceSummarySidebar({model: this.model});
            this.view.render();
        });

        it("renders the name of the workspace in an h1", function() {
            expect(this.view.$("h1").text().trim()).toBe(this.model.get("name"));
        });

        context("the workspace has an image", function() {
            beforeEach(function() {
                spyOn(this.view.model, 'hasImage').andReturn(true);
                spyOn(this.view.model, 'imageUrl').andReturn("http://partytime.com/party.gif")
                this.view.render();
            });

            it("renders the workspace image", function() {
                expect(this.view.$("img.workspace_image").attr("src")).toContain('http://partytime.com/party.gif');
            });
        });

        context("the workspace does not have an image", function() {
            beforeEach(function() {
                spyOn(this.view.model, 'hasImage').andReturn(false);
                spyOn(this.view.model, 'imageUrl').andReturn("http://partytime.com/party.gif")
                this.view.render();
            });

            it("does not render the workspace image", function() {
                expect(this.view.$("img.workspace_image")).not.toExist();
            });
        });

        context("the current user has update permissions on the workspace", function() {
            beforeEach(function() {
                spyOn(this.model, "canUpdate").andReturn(true);
                this.view.render();
            });

            it("has a link to edit workspace settings", function() {
                expect(this.view.$("a.dialog[data-dialog=WorkspaceSettings]").text().trim()).toMatchTranslation("actions.edit_workspace");
            });

            it("has a link to delete the workspace", function() {
                expect(this.view.$("a.alert[data-alert=WorkspaceDelete]").text().trim()).toMatchTranslation("actions.delete_workspace");
            });

            it("has a link to edit members of the workspace", function() {
                expect(this.view.$("a.dialog[data-dialog=WorkspaceEditMembers]").text().trim()).toMatchTranslation("workspace.edit_members");
            });
        });

        context("the current user does not have update permissions on the workspace", function() {
            beforeEach(function() {
                spyOn(this.model, "canUpdate").andReturn(false);
                this.view.render();
            });

            it("does not have a link to edit workspace settings", function() {
                expect(this.view.$("a[data-dialog=WorkspaceSettings]").length).toBe(0);
            });

            it("does not have a link to delete the workspace", function() {
                expect(this.view.$("a[data-alert=WorkspaceDelete]").length).toBe(0);
            })

            it("does not have a link to edit the workspace members", function() {
                expect(this.view.$("a[data-dialog=WorkspaceEditMembers]").length).toBe(0);
            })
        });

        it("has a link to add a note", function() {
            expect(this.view.$("a[data-dialog=NotesNew]").text().trim()).toMatchTranslation("actions.add_note");
            expect(this.view.$("a[data-dialog=NotesNew]").attr("data-entity-type")).toBe("workspace");
            expect(this.view.$("a[data-dialog=NotesNew]").attr("data-entity-id")).toBe(this.model.get("id"))
        });
    });
});