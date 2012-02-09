describe("chorus.pages.WorkfileShowPage", function() {
    beforeEach(function() {
        this.workspaceId = 4;
        this.workfileId = 5;
        this.workspace = fixtures.workspace({id: this.workspaceId});
        this.model = fixtures.sqlWorkfile({id: this.workfileId, workspaceId: this.workspaceId});
        stubDefer();
   });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.views.WorkfileContentDetails, 'buildFor').andCallThrough();
            spyOn(chorus.views.WorkfileContent, 'buildFor').andCallThrough();
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
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

        it("does not instantiate any views", function() {
            expect(this.page.mainContent).toBeUndefined();
            expect(this.page.sidebar).toBeUndefined();
            expect(this.page.subNav).toBeUndefined();
            expect(this.page.breadcrumbs).toBeUndefined();

        })

        context("with a version number", function() {
            beforeEach(function() {
                this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId, '16');
            });

            it("configures the version number into the workfile model", function() {
                expect(this.page.model.isLatestVersion()).toBeFalsy();
            })

        })

        describe("when the workspace and workfile are fetched", function() {
            beforeEach(function() {
                spyOn(chorus.views.Base.prototype, "render").andCallThrough();
                this.server.completeFetchFor(this.workspace);
            });

            context("and the workfile does not have a draft", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.model);
                    chorus.views.Base.prototype.render.reset();
                    this.page.resourcesLoaded();
                })

                it("loads breadcrumbs, sidebar, subnavigation, and mainContent", function() {
                    expect(this.page.breadcrumbs).toBeDefined()
                    expect(this.page.sidebar).toBeDefined()
                    expect(this.page.subNav).toBeDefined()
                    expect(this.page.mainContent).toBeDefined()
                })

                it("instantiates the content details view", function() {
                    expect(chorus.views.WorkfileContentDetails.buildFor).toHaveBeenCalledWith(this.page.model)
                });

                it("instantiates the content view", function() {
                    expect(chorus.views.WorkfileContent.buildFor).toHaveBeenCalledWith(this.page.model)
                });

                it("re-renders", function() {
                    expect(chorus.views.Base.prototype.render).toHaveBeenCalled();
                });
            })

            context('and the workfile has a draft', function() {
                beforeEach(function() {
                    this.model.set({'draftInfo': fixtures.workfileDraft(), hasDraft: true});
                    stubModals();
                    spyOn(chorus.Modal.prototype, 'launchModal').andCallThrough();
                    this.server.completeFetchFor(this.model);
                })

                it("shows an alert", function() {
                    expect(chorus.Modal.prototype.launchModal).toHaveBeenCalled();
                })

                context("and the user chooses the draft", function() {
                    beforeEach(function() {
                        spyOn(this.page, "render");
                        chorus.Modal.prototype.launchModal.reset();
                        this.page.model.isDraft = true;
                        this.page.model.trigger('change');
                    })

                    it("does not show an alert", function() {
                        expect(chorus.Modal.prototype.launchModal).not.toHaveBeenCalled();
                    })
                })
            })
        });
    });

    describe("#render", function(){
        beforeEach(function() {
            this.spy = spyOn(chorus.views.DatabaseFunctionSidebarList.prototype, "forwardEvent").andCallThrough();
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
            this.server.completeFetchFor(this.model);
            this.server.completeFetchFor(this.workspace);
            this.page.model.workspace().set({name: "Cool Workspace"});
            this.page.resourcesLoaded();
        });

        it("forward the events", function() {
            expect(chorus.views.DatabaseFunctionSidebarList.prototype.forwardEvent).toHaveBeenCalled();
        });

        it("when the model has changed again does not forward the events again", function() {
            chorus.views.DatabaseFunctionSidebarList.prototype.forwardEvent.reset();
            this.page.modelChanged();
            expect(chorus.views.DatabaseFunctionSidebarList.prototype.forwardEvent).not.toHaveBeenCalled();
        });

        it("it displays the workfile name in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("h1").text()).toBe(this.model.get('fileName'));
        });

        it("displays the file icon in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl('sql'));
        });

        describe("the workfile detail view raises file:save event", function() {
            beforeEach(function() {
                spyOnEvent(this.page.mainContent.content, 'file:saveCurrent');
                this.page.mainContent.contentDetails.trigger("file:saveCurrent");
            });

            it("relays the event to the workfile content", function() {
                expect('file:saveCurrent').toHaveBeenTriggeredOn(this.page.mainContent.content);
            });
        });

        describe("the workfile detail view raises file:runCurrent event", function() {
            beforeEach(function() {
            this.page.model.workspace().set({
                sandboxInfo : {
                    databaseId: '3',
                    databaseName: "db",
                    instanceId: '2',
                    instanceName: "instance",
                    sandboxId: "10001",
                    schemaId: '4',
                    schemaName: "schema"
                }});

                spyOnEvent(this.page.mainContent.content, 'file:runCurrent');
                this.page.mainContent.contentDetails.trigger("file:runCurrent");
            });

            it("relays the event to the workfile content", function() {
                expect('file:runCurrent').toHaveBeenTriggeredOn(this.page.mainContent.content);
            });
        });

        describe("the workfile detail view raises file:runInSchema event", function() {
            beforeEach(function() {
                spyOnEvent(this.page.mainContent.content, 'file:runInSchema');
                this.page.mainContent.contentDetails.trigger("file:runInSchema", {
                    instance: "4",
                    database: "5",
                    schema: "6"
                });
            });

            it("relays the event to the workfile content", function() {
                expect('file:runInSchema').toHaveBeenTriggeredOn(this.page.mainContent.content);
            });
        });

        context("when the content triggers autosaved", function() {
            beforeEach(function() {
                this.page.render();
                spyOnEvent(this.page.model, "invalidated");
                this.page.mainContent.content.trigger("autosaved");
            });

            it("triggers invalidated on the model", function() {
                expect("invalidated").toHaveBeenTriggeredOn(this.page.model);
            });
        });

        describe("when the sidebar triggers 'file:insertText'", function() {
            beforeEach(function() {
                this.page.render()
                spyOnEvent(this.page.mainContent.content, 'file:insertText')
                spyOn(this.page.model, 'isSql').andReturn(true)
                this.page.sidebar.functionList.trigger("file:insertText", "");
            })

            it("should relay the event to textContent", function() {
                expect('file:insertText').toHaveBeenTriggeredOn(this.page.mainContent.content)
            })
        })

        describe("when the content triggers file:executionCompleted", function() {
            beforeEach(function() {
                this.page.render();
                spyOnEvent(this.page.mainContent.contentDetails, 'file:executionCompleted');
                this.page.mainContent.content.trigger("file:executionCompleted", fixtures.taskWithResult());
            });
            it("should relay event to the contentDetails", function() {
                expect('file:executionCompleted').toHaveBeenTriggeredOn(this.page.mainContent.contentDetails);
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
