describe("chorus.pages.WorkfileShowPage", function() {
    beforeEach(function() {
        chorus.page = { workspace: rspecFixtures.workspace() };
        this.workspaceId = 4;
        this.workfileId = 5;
        this.workspace = rspecFixtures.workspace({id: this.workspaceId});
        this.model = rspecFixtures.workfile.sql({id: this.workfileId, workspace: {id: this.workspaceId}});
        stubDefer();
    });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.views.WorkfileContentDetails, 'buildFor').andCallThrough();
            spyOn(chorus.views.WorkfileContent, 'buildFor').andCallThrough();
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
        });

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("workfile")
        })

        it("sets the workspace id, for prioritizing search", function() {
            expect(this.page.workspaceId).toBe(4);
        });

        it("instantiates and fetches a workfile with the given id", function() {
            var workfile = this.page.model;
            expect(workfile.get("id")).toBe(this.workfileId);
            expect(this.server.lastFetchFor(this.page.model)).toBeDefined();
        });

        it("does not configure a version number into the workfile model", function() {
            expect(this.page.model.isLatestVersion()).toBeTruthy();
        })

        it("fetches the workfile's workspace", function() {
            expect(this.server.lastFetchFor(this.page.model.workspace())).toBeDefined();
        });

        it("displays a loading spinner when rendered before fetches complete", function() {
            this.page.render();
            expect(this.page.$(".loading_section")).toExist();
        });

        context("with a version number", function() {
            beforeEach(function() {
                this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId, '16');
            });

            it("configures the version number into the workfile model", function() {
                expect(this.page.model.isLatestVersion()).toBeFalsy();
            })
        })

        describe("fetch failure", function() {
            beforeEach(function() {
                spyOn(Backbone.history, "loadUrl");
            });

            it("navigates to the 404 page for the model", function() {
                this.page.model.trigger('resourceNotFound', this.page.model);
                expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute");
            });

            it("navigates to the 404 page for the workspace", function() {
                this.page.workspace.trigger('resourceNotFound', this.page.workspace);
                expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute");
            });
        });

        describe("when the workspace and workfile are fetched", function() {
            beforeEach(function() {
                spyOn(chorus.views.Base.prototype, "render").andCallThrough();
                this.server.completeFetchFor(this.workspace);
            });

            context("and the workfile does not have a draft", function() {
                beforeEach(function() {
                    chorus.views.Base.prototype.render.reset();
                    this.server.completeFetchFor(this.model);
                });

                it("loads breadcrumbs, sidebar, subnavigation, and mainContent", function() {
                    expect(this.page.breadcrumbs).toBeDefined();
                    expect(this.page.sidebar).toBeDefined();
                    expect(this.page.subNav).toBeDefined();
                    expect(this.page.mainContent).toBeDefined();
                });

                it("instantiates the content details view", function() {
                    expect(chorus.views.WorkfileContentDetails.buildFor).toHaveBeenCalledWith(this.page.model, this.page.mainContent.content);
                });

                it("instantiates the content view", function() {
                    expect(chorus.views.WorkfileContent.buildFor).toHaveBeenCalledWith(this.page.model);
                });

                it("renders again", function() {
                    expect(chorus.views.Base.prototype.render).toHaveBeenCalled();
                });
            });

            context('and the workfile has a draft', function() {
                beforeEach(function() {
                    this.model.set({'draftInfo': fixtures.workfileDraft(), hasDraft: true});
                    this.modalSpy = stubModals();
                    this.server.completeFetchFor(this.model);
                });

                it("shows a workfile draft alert", function() {
                    expect(this.modalSpy).toHaveModal(chorus.alerts.WorkfileDraft);
                });

                context("and the user chooses the draft", function() {
                    beforeEach(function() {
                        this.modalSpy.reset();
                        spyOn(this.page, "render");
                        this.page.model.isDraft = true;
                        this.page.model.trigger('change');
                    });

                    it("does not show an alert", function() {
                        expect(this.modalSpy).not.toHaveModal(chorus.alerts.WorkfileDraft);
                    })
                })
            })
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.spy = spyOn(chorus.views.DatabaseFunctionSidebarList.prototype, "forwardEvent").andCallThrough();
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
            this.server.completeFetchFor(this.model);
            this.server.completeFetchFor(this.workspace);
            this.page.model.workspace().set({name: "Cool Workspace"});
            this.page.resourcesLoaded();
        });

        it("it displays the workfile name in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("h1").text()).toBe(this.model.get('fileName'));
            expect(this.page.mainContent.contentHeader.$("h1").attr("title")).toBe(this.model.get('fileName'));
        });

        it("displays the file icon in the content header", function() {
            spyOn(this.page.model, "isImage").andReturn(false);
            this.page.render();
            expect(this.page.mainContent.contentHeader.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl('sql'));
        });

        context("when the content broadcasts file:autosaved", function() {
            beforeEach(function() {
                this.page.render();
                spyOnEvent(this.page.model, "invalidated");
                chorus.PageEvents.broadcast("file:autosaved");
            });

            it("triggers invalidated on the model", function() {
                expect("invalidated").toHaveBeenTriggeredOn(this.page.model);
            });
        });

        describe("breadcrumbs", function() {
            it("renders home > Workspaces > {workspace name} > All work files > {workfile name}", function() {
                expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
                expect(this.page.$(".breadcrumb:eq(0) a").text()).toMatchTranslation("breadcrumbs.home");

                expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces");
                expect(this.page.$(".breadcrumb:eq(1) a").text()).toMatchTranslation("breadcrumbs.workspaces");

                expect(this.page.$(".breadcrumb:eq(2) a").attr("href")).toBe("#/workspaces/4");
                expect(this.page.$(".breadcrumb:eq(2) a").text()).toBe("Cool Workspace");

                expect(this.page.$(".breadcrumb:eq(3)").text().trim()).toMatchTranslation("breadcrumbs.workfiles.all");
                expect(this.page.$(".breadcrumb:eq(3) a").attr("href")).toBe("#/workspaces/4/workfiles");

                expect(this.page.$(".breadcrumb:eq(4)").text().trim()).toBe(this.model.get('fileName'));
            });

            context("with a long workspace name", function() {
                beforeEach(function() {
                    this.page.model.workspace().set({name: "LongLongLongLongLongWorkspaceName"});
                    this.page.render();
                });

                it("ellipsizes the workspace name in the breadcrumb view", function() {
                    expect(this.page.$(".breadcrumb:eq(2) a").attr("href")).toBe("#/workspaces/4");
                    expect(this.page.$(".breadcrumb:eq(2) a").text()).toBe("LongLongLongLongLong...");
                });
            })
        });
    });
});
