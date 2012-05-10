describe("chorus.views.WorkspaceShowSidebar", function() {
    beforeEach(function() {
            this.model = newFixtures.workspace({
                name: "A Cool Workspace",
                id: '123',
                image: {
                    icon: "/system/workspaces/images/000/000/005/icon/workspaceimage.jpg",
                    original: "/system/workspaces/images/000/000/005/original/workspaceimage.jpg"
                }});
    });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(this.model.members(), 'fetch');
            spyOn(this.model.members(), 'bind').andCallThrough();
            this.view = new chorus.views.WorkspaceShowSidebar({model: this.model});
        });

        it("fetches the workspace's members", function() {
            expect(this.model.members().fetch).toHaveBeenCalled();
        });

        it("binds render to the reset of the collection", function() {
            expect(this.model.members().bind).toHaveBeenCalledWith('reset', this.view.render, this.view);
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.WorkspaceShowSidebar({model: this.model});
            this.view.render();
        });

        it("renders the name of the workspace in an h1", function() {
            expect(this.view.$("h1").text().trim()).toBe(this.model.get("name"));
            expect(this.view.$("h1").attr("title").trim()).toBe(this.model.get("name"));
        });

        context("the workspace has an image", function() {
            beforeEach(function() {
                spyOn(this.view.model, 'hasImage').andReturn(true);
                this.spyImg = spyOn(this.view.model, 'fetchImageUrl').andReturn("imageUrl1")
                this.view.render();
            });

            it("renders the workspace image", function() {
                expect(this.view.$("img.workspace_image").attr("src")).toContain("imageUrl1");
            });

            it("renders the sidebar when image is changed", function() {
                this.spyImg.andReturn("imageUrl2");
                this.view.model.trigger("image:change");
                expect(this.view.$("img.workspace_image").attr("src")).toContain("imageUrl2");
            });

            context("and the image is loaded", function() {
                beforeEach(function() {
                    spyOn(this.view, 'recalculateScrolling').andCallThrough();
                    this.view.render();
                    this.view.recalculateScrolling.reset();
                    this.view.$('.workspace_image').trigger('load');
                });

                it("calls recalculateScrolling", function() {
                    expect(this.view.recalculateScrolling).toHaveBeenCalled();
                });
            });
        });

        context("the workspace does not have an image", function() {
            beforeEach(function() {
                spyOn(this.view.model, 'hasImage').andReturn(false);
                spyOn(this.view.model, 'fetchImageUrl').andReturn("/party.gif")
                this.view.render();
            });

            it("does not render the workspace image", function() {
                expect(this.view.$("img.workspace_image")).not.toExist();
            });
        });

        context("when the current user has workspace admin permissions on the workspace", function() {
            beforeEach(function() {
                spyOn(this.model, "workspaceAdmin").andReturn(true);
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

            context("and the workspace does not have a sandbox", function() {
                beforeEach(function() {
                    spyOn(this.model, "sandbox").andReturn(undefined)
                    this.view.render();
                });

                it("has a link to add a new sandbox", function() {
                    expect(this.view.$("a.dialog[data-dialog=SandboxNew]").text().trim()).toMatchTranslation("sandbox.create_a_sandbox");
                    expect(this.view.$("a.dialog[data-dialog=SandboxNew]").data("workspaceId").toString()).toBe(this.model.get("id"));
                });
            });

            context("and the workspace has a sandbox", function() {
                beforeEach(function() {
                    spyOn(this.model, "sandbox").andReturn(newFixtures.sandbox())
                    this.view.render();
                });

                it("does not have a link to add a new sandbox", function() {
                    expect(this.view.$("a.dialog[data-dialog=SandboxNew]")).not.toExist();
                });
            });
        });

        context("when the current user is a member of the workspace, but not an admin/owner", function() {
            beforeEach(function() {
                spyOn(this.model, "workspaceAdmin").andReturn(false);
                spyOn(this.model, "currentUserIsMember").andReturn(true);
                this.view.render();
            });

            it("has a link to edit the workspace's settings", function() {
                expect(this.view.$("a.dialog[data-dialog=WorkspaceSettings]").text().trim()).toMatchTranslation("actions.edit_workspace");
            });
        });

        context("when the current user is not a member of the workspace", function() {
            beforeEach(function() {
                spyOn(this.model, "workspaceAdmin").andReturn(false);
                spyOn(this.model, "currentUserIsMember").andReturn(false);
                this.view.render();
            });

            it("has a link to view the workspace's settings", function() {
                expect(this.view.$("a[data-dialog=WorkspaceSettings]").text().trim()).toMatchTranslation("actions.view_workspace_settings");
            });

            it("does not have a link to delete the workspace", function() {
                expect(this.view.$("a[data-alert=WorkspaceDelete]").length).toBe(0);
            })

            it("does not have a link to edit the workspace members", function() {
                expect(this.view.$("a[data-dialog=WorkspaceEditMembers]").length).toBe(0);
            })
        });

        context("when the workspace is archived", function() {
            beforeEach(function() {
                spyOn(this.model, "workspaceAdmin").andReturn(true);
                spyOn(this.view.model, "sandbox").andReturn(false);
                this.view.model.set({archived_at: "2012-05-08 21:40:14"});
                this.view.render();
            });
            it("does not have the 'add or edit members link'", function() {
                expect(this.view.$('a[data-dialog="WorkspaceEditMembers"]')).not.toExist();
            });
            it("does not have the 'add a sandbox' link", function() {
               expect(this.view.$('a[data-dialog="SandboxNew"]')).not.toExist();
            });
            it("does not have 'add a note' or 'ad an insight' link", function() {
               expect(this.view.$('a[data-dialog="NotesNew"]')).not.toExist();
               expect(this.view.$('a[data-dialog="InsightsNew"]')).not.toExist();
            });
        });

        it("has a link to add a note", function() {
            expect(this.view.$("a[data-dialog=NotesNew]").text().trim()).toMatchTranslation("actions.add_note");
            expect(this.view.$("a[data-dialog=NotesNew]").attr("data-entity-type")).toBe("workspace");
            expect(this.view.$("a[data-dialog=NotesNew]").attr("data-entity-id")).toBe(this.model.get("id"))
            expect(this.view.$("a[data-dialog=NotesNew]").attr("data-workspace-id")).toBe(this.model.get("id"))
        });

        it("has a link to add an insight", function() {
            expect(this.view.$("a[data-dialog=InsightsNew]").text().trim()).toMatchTranslation("actions.add_insight");
            expect(this.view.$("a[data-dialog=InsightsNew]").attr("data-workspace-id")).toBe(this.model.get("id"))
        });

        it("should have a members list subview", function() {
            expect(this.view.$(".workspace_member_list")[0]).toBe(this.view.workspaceMemberList.el);
        })
    });

    describe("#post_render", function() {
        it("unhides the .after_image area after the .workspace_image loads", function() {
            this.view = new chorus.views.WorkspaceShowSidebar({model: this.model});
            spyOn($.fn, 'removeClass');
            $('#jasmine_content').append(this.view.el);
            this.view.render();
            expect($.fn.removeClass).not.toHaveBeenCalledWith('hidden');
            $(".workspace_image").trigger('load');
            expect($.fn.removeClass).toHaveBeenCalledWith('hidden');
            expect($.fn.removeClass).toHaveBeenCalledOnSelector('.after_image');
        });
    });
});
