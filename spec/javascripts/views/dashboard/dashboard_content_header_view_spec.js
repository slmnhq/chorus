describe("chorus.views.DashboardContentHeader", function() {
    beforeEach(function() {
        this.view = new chorus.views.DashboardContentHeader();
    });

    describe("#setup", function() {
        beforeEach(function() {
            this.insights = new chorus.models.CommentInsight({action: "count"});
        });

        it("fetches the number of insights", function() {
            expect(this.server.lastFetchFor(this.insights)).toBeDefined();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.insights, { count: 5 });
            });

            it("should display the number of insights", function() {
                expect(this.view.$(".menus .count").text()).toBe('5');
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the title", function() {
            expect(this.view.$("h1").text()).toMatchTranslation("dashboard.activity");
        });

        it("should have a filter menu", function() {
            expect(this.view.$(".menus .title")).toContainTranslation("filter.show");
            expect(this.view.$(".menus .all")).toContainTranslation("filter.all_activity");
            expect(this.view.$(".menus .insights")).toContainTranslation("filter.only_insights");
        });

        describe("clicking on 'Insights'", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "filter:insights");
                this.view.$(".menus .insights").click();
            });

            it("should trigger the filter:insights event on itself", function() {
                expect("filter:insights").toHaveBeenTriggeredOn(this.view);
            });
        });

        describe("clicking on 'All Activity'", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "filter:all");
                this.view.$(".menus .all").click();
            });

            it("should trigger the filter:all event on itself", function() {
                expect("filter:all").toHaveBeenTriggeredOn(this.view);
            });
        });
    });
})
