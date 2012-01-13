describe("chorus.pages.WorkfileShowPage", function() {
    beforeEach(function() {
        this.workspaceId = 4;
        this.workfileId = 5;
    });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.views.WorkfileContentDetails, 'buildFor').andCallThrough();
            spyOn(chorus.views.WorkfileContent, 'buildFor').andCallThrough();
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
        });
        it("instantiates and fetches a workspace with  given id", function() {
            var workspace = this.page.workspace;
            expect(workspace.get("id")).toBe(this.workspaceId);
            expect(this.server.requests[0].url).toBe(workspace.url());
        });

        it("instantiates and fetches a workfile with ehe given id", function() {
            var workfile = this.page.model;
            expect(workfile.get("id")).toBe(this.workfileId);
            expect(this.server.requests[1].url).toBe(workfile.url());
        });

        it("does not instantiate views for the content details or content", function() {
            expect(this.page.mainContent.contentDetails).toBeUndefined();
            expect(this.page.mainContent.content).toBeUndefined();
        });

        describe("when the workfile is fetched", function() {
            beforeEach(function() {
                spyOn(this.page.mainContent, "render");
                fixtures.model = "Workfile";
            });

            context("and the workfile does not have a draft", function() {
                beforeEach(function() {
                    this.server.respondWith(
                        'GET',
                        this.page.model.url(),
                        this.prepareResponse(fixtures.jsonFor("fetch")));
                    this.server.respond();
                })

                it("instantiates the content details view", function() {
                    expect(chorus.views.WorkfileContentDetails.buildFor).toHaveBeenCalledWith(this.page.model)
                });

                it("instantiates the content view", function() {
                    expect(chorus.views.WorkfileContent.buildFor).toHaveBeenCalledWith(this.page.model)
                });

                it("re-renders the mainContent", function() {
                    expect(this.page.mainContent.render).toHaveBeenCalled();
                });
            })

            context('and the workfile has a draft', function() {
                beforeEach(function() {
                    stubModals();
                    spyOn(chorus.Modal.prototype, 'launchModal').andCallThrough();
                    this.server.respondWith(
                        'GET',
                        this.page.model.url(),
                        this.prepareResponse(fixtures.jsonFor("fetchWithDraft")));
                    this.server.respond();
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
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
            this.page.workspace.set({name: "Cool Workspace"});
            fixtures.model = "Workfile";
            this.server.respondWith(
                'GET',
                this.page.model.url(),
                this.prepareResponse(fixtures.jsonFor("fetch")));
            this.server.respond();
        });

        it("it displays the workfile name in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("h1").text()).toBe("who.sql");
        });

        it("displays the file icon in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl('sql'));
        });

        describe("the workfile detail view raises file:save event", function() {
            beforeEach(function() {
                this.saveSpy = jasmine.createSpy("file:saveCurrent");
                this.page.mainContent.content.bind("file:saveCurrent", this.saveSpy);

                this.page.mainContent.contentDetails.trigger("file:saveCurrent");
            });

            it("relays the event to the workfile content", function() {
                expect(this.saveSpy).toHaveBeenCalled();
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

        describe("breadcrumbs", function() {

        it("renders home > {workspace name} > All work files > {workfile name}", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0) a").text()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces/4");
            expect(this.page.$(".breadcrumb:eq(1) a").text()).toBe("Cool Workspace");

            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toMatchTranslation("breadcrumbs.workfiles.all");
            expect(this.page.$(".breadcrumb:eq(2) a").attr("href")).toBe("#/workspaces/4/workfiles");

            expect(this.page.$(".breadcrumb:eq(3)").text().trim()).toBe("who.sql");

        });
        });
    })

    describe("oldVersion", function() {
        it("sets oldVersion true", function() {
            this.page = new chorus.pages.WorkfileShowPage("1", "100", "1000");
            expect(this.page.isOldVersion).toBe(true);
        });
        it("sets oldVersion true", function() {
            this.page = new chorus.pages.WorkfileShowPage("1", "100");
            expect(this.page.isOldVersion).toBe(false);
        })
    });
});
