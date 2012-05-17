describe("chorus.pages.WorkspaceShowPage", function() {
    beforeEach(function() {
        spyOn($, 'cookie').andReturn(null)
    });

    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage('4');
        })

        it("sets up the model properly", function() {
            expect(this.page.model.get("id")).toBe('4');
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/workspaces/4");
        })

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("workspace_summary")
        })

        it("sets the workspaceId, for prioritizing search", function() {
            expect(this.page.workspaceId).toBe('4');
        });

        describe("when we are in quickstart mode", function() {
            beforeEach(function() {
                spyOn(chorus.views.WorkspaceQuickstart, "quickstartFinishedFor").andReturn(false);
                spyOn(chorus.router, "navigate");
                this.page = new chorus.pages.WorkspaceShowPage('4');
            });

            it("navigates to the quickstart page", function() {
                expect(chorus.views.WorkspaceQuickstart.quickstartFinishedFor).toHaveBeenCalledWith('4');
                expect(chorus.router.navigate).toHaveBeenCalledWith("/workspaces/4/quickstart");
            });

            it("doesn't break the breadcrumbs", function() {
                var page = this.page;
                expect(function(){ page.crumbs() }).not.toThrow();
            });
        });

        describe("when we are not in quickstart mode", function() {
            beforeEach(function() {
                spyOn(chorus.views.WorkspaceQuickstart, "quickstartFinishedFor").andReturn(true);
                spyOn(chorus.router, "navigate");
                this.page = new chorus.pages.WorkspaceShowPage('4');
            });

            it("navigates to the quickstart page", function() {
                expect(chorus.views.WorkspaceQuickstart.quickstartFinishedFor).toHaveBeenCalledWith('4');
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage(4);
        });

        context("while the model is loading", function() {
            beforeEach(function() {
                this.page.model.loaded = false;
                this.page.render();
            });

            it("displays some breadcrumbs", function() {
                expect(this.page.$(".breadcrumb")).toContainTranslation("breadcrumbs.home")
            });
        });

        context("when the model fails to load properly", function() {
            beforeEach(function() {
                spyOn(Backbone.history, "loadUrl")
                this.page.model.trigger('fetchNotFound')
            })

            it("navigates to the 404 page", function() {
                expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
            })
        })

        context("when the model has loaded", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.model, newFixtures.workspace({summary: "this is a summary", name: "Cool Workspace"}));
                this.server.completeFetchFor(this.page.model.activities(), [fixtures.activities.NOTE_ON_WORKFILE(), fixtures.activities.INSIGHT_CREATED()]);
                this.server.completeFetchFor(this.page.mainContent.contentHeader.activityListHeader.insightCount, { numberOfInsight: 5 });
                this.page.render();
            });

            it("displays all activities by default", function() {
                expect(this.page.mainContent.content.$("ul.activities li.activity").length).toBe(2);
            });

            describe("clicking the insight/activity links", function() {
                beforeEach(function() {
                    this.server.reset();
                    this.page.mainContent.contentHeader.$("a.insights").click();
                });

                it("fetches the insights", function() {
                    expect(this.page.model.activities()).toHaveBeenFetched();
                });
            });

            it("uses the workspace's summary for the text of the header", function() {
                expect(this.page.mainContent.contentHeader.$(".original").text()).toBe(this.page.model.get("summary"));
            });

            it("displays the breadcrumbs", function() {
                expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
                expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toBe(t("breadcrumbs.home"));

                expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces");
                expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toBe(t("breadcrumbs.workspaces"));

                expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("Cool Workspace");
            });

            context("when the model changes", function() {
                beforeEach(function() {
                    this.page.model.set({name: "bar", public: false});
                });

                it("displays the new breadcrumb automatically", function() {
                    expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("bar");
                });

                it("updates the title", function() {
                    expect(this.page.$("h1")).toContainText("bar");
                });

                it("changes the icon", function() {
                    expect(this.page.$(".activity_list_header .title img").attr("src")).toBe("/images/workspaces/private_workspace_large.png");
                });
            });
        });
    });
});
