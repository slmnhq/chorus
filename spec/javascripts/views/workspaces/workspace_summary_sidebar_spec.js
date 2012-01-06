describe("chorus.views.WorkspaceSummarySidebar", function() {
    describe("#setup", function() {
        beforeEach(function() {
            this.model = new chorus.models.Workspace({name: "A Cool Workspace", id: '123'});
            spyOn(this.model.members(), 'fetch');
            spyOn(this.model.members(), 'bind').andCallThrough();
            this.view = new chorus.views.WorkspaceSummarySidebar({model: this.model});
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
                this.spyImg = spyOn(this.view.model, 'imageUrl').andReturn("/party.gif")
                this.view.render();
            });

            it("renders the workspace image", function() {
                expect(this.view.$("img.workspace_image").attr("src")).toContain('/party.gif');
            });

            it("renders the sidebar when image is changed", function() {
                this.spyImg.andReturn("/partyAgain.gif")
                this.view.model.trigger("image:change");
                expect(this.view.$("img.workspace_image").attr("src")).toContain('/partyAgain.gif');
            });

            context("and the image is loaded", function() {
                beforeEach(function() {
                    spyOn(this.view, 'setupSidebarScrolling').andCallThrough();
                    this.view.render();
                    this.view.setupSidebarScrolling.reset();
                    this.view.$('.workspace_image').trigger('load');
                });

                it("calls setupSidebarScrolling", function() {
                    expect(this.view.setupSidebarScrolling).toHaveBeenCalled();
                });
            });
        });

        context("the workspace does not have an image", function() {
            beforeEach(function() {
                spyOn(this.view.model, 'hasImage').andReturn(false);
                spyOn(this.view.model, 'imageUrl').andReturn("/party.gif")
                this.view.render();
            });

            it("does not render the workspace image", function() {
                expect(this.view.$("img.workspace_image")).not.toExist();
            });
        });

        context("the current user has workspace admin permissions on the workspace", function() {
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

            context("the sandboxId is null", function() {
                beforeEach(function() {
                    this.model.set({sandboxId: null});
                    this.view.render();
                });

                it("has a link to add a new sandbox", function() {
                    expect(this.view.$("a.dialog[data-dialog=SandboxNew]").text().trim()).toMatchTranslation("sandbox.create_a_sandbox");
                    expect(this.view.$("a.dialog[data-dialog=SandboxNew]").data("workspaceId").toString()).toBe(this.model.get("id"));
                });
            });

            context("there is a sandboxId", function() {
                beforeEach(function() {
                    this.model.set({sandboxId: "1234"});
                    this.view.render();
                });

                it("does not have a link to add a new sandbox", function() {
                    expect(this.view.$("a.dialog[data-dialog=SandboxNew]")).not.toExist();
                });
            });
        });

        context("the current user does not have workspace admin permissions on the workspace", function() {
            beforeEach(function() {
                spyOn(this.model, "workspaceAdmin").andReturn(false);
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

        describe("the members list", function() {
            var members;
            beforeEach(function() {
                members = this.model.members();
                _.times(3, function() {
                    members.add(fixtures.user());
                });
                this.view.render();
            });

            it("includes an image for each member", function() {
                var images = this.view.$(".members img");
                expect(images.length).toBe(3);
                expect(images.eq(0).attr("src")).toBe(members.models[0].imageUrl({ size: 'icon' }));
                expect(images.eq(1).attr("src")).toBe(members.models[1].imageUrl({ size: 'icon' }));
                expect(images.eq(2).attr("src")).toBe(members.models[2].imageUrl({ size: 'icon' }));
            });

            it("has a title for each member that is their display Name", function() {
                var links = this.view.$(".members li a");
                expect(links.eq(0).attr("title")).toBe(members.models[0].displayName());
                expect(links.eq(1).attr("title")).toBe(members.models[1].displayName());
                expect(links.eq(2).attr("title")).toBe(members.models[2].displayName());
            })

            it("includes a link to each member's page", function() {
                var links = this.view.$(".members li a");
                expect(links.length).toBe(3);
                expect(links.eq(0).attr("href")).toBe(members.models[0].showUrl());
                expect(links.eq(1).attr("href")).toBe(members.models[1].showUrl());
                expect(links.eq(2).attr("href")).toBe(members.models[2].showUrl());
            });

            it("does not have the more workspace members link", function() {
                expect(this.view.$(".members a.dialog[data-dialog=WorkspaceMembersMore]").length).toBe(0)
            })

            context("when there are more than 24 members", function() {
                beforeEach(function() {
                    _.times(25, function() {
                        members.add(fixtures.user());
                    });
                    this.view.render();
                });

                it("only shows the first 24 images", function() {
                    expect(this.view.$(".members img").length).toBe(24);
                });

                it("has a X more workspace members link", function() {
                    expect(this.view.$(".members a.dialog[data-dialog=WorkspaceMembersMore]").length).toBe(1)
                });


            });
        });
    });

    describe("#post_render", function() {
        it("unhides the .after_image area after the .workspace_image loads", function() {
            this.model = fixtures.workspace({iconId: '123'});
            this.view = new chorus.views.WorkspaceSummarySidebar({model: this.model});
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
