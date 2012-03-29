describe("chorus.pages.WorkspaceShowPage", function() {
    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage('4');
        })

        it("sets up the model properly", function() {
            expect(this.page.model.get("id")).toBe('4');
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("workspace_summary")
        })

        it("sets the workspaceId, for prioritizing search", function() {
            expect(this.page.workspaceId).toBe('4');
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkspaceShowPage(4);
        })

        context("while the model is loading", function(){
            beforeEach(function(){
                this.page.model.loaded = false;
                this.page.render();
            });

            it("displays some breadcrumbs", function(){
                expect(this.page.$(".breadcrumb")).toContainTranslation("breadcrumbs.home")
            });
        });

        context("when the model fails to load properly", function() {
            beforeEach(function() {
                spyOn(Backbone.history, "loadUrl")
                this.page.model.trigger('fetchFailed')
            })

            it("navigates to the 404 page", function() {
                expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
            })
        })

        context("when the model has loaded", function(){
            beforeEach(function(){
                this.server.completeFetchFor(this.page.model, fixtures.workspace({summary: "this is a summary", name : "Cool Workspace"}))
                this.server.completeFetchFor(this.page.model.activities(), [fixtures.activities.NOTE_ON_WORKFILE(), fixtures.activities.INSIGHT_CREATED()])
                this.server.completeFetchFor(this.page.mainContent.contentHeader.activityListHeader.insightCount, { numberOfInsight: 5 });
                this.page.render();
            });

            it("displays all activities by default", function() {
                expect(this.page.mainContent.content.$("ul.activities li.activity").length).toBe(2);
            })

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

            it("displays the breadcrumbs", function(){
                expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
                expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toBe(t("breadcrumbs.home"));

                expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces");
                expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toBe(t("breadcrumbs.workspaces"));

                expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("Cool Workspace");
            });

            context("when the model changes", function(){
                beforeEach(function(){
                    this.page.model.set({name: "bar"})
                });

                it("displays the new breadcrumb automatically", function(){
                    expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("bar");
                });

                it("updates the title", function() {
                    expect(this.page.$("h1")).toContainText("bar");
                });
            });
        });
    });
});
