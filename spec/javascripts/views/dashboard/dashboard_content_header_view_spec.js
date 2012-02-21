describe("chorus.views.DashboardContentHeader", function() {
    beforeEach(function() {
        this.view = new chorus.views.DashboardContentHeader();
    });

    describe("#setup", function() {
        beforeEach(function() {
            this.insightCount = new chorus.models.CommentInsight.count();
        });

        it("fetches the number of insights", function() {
            expect(this.insightCount).toHaveBeenFetched();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.insightCount, { numberOfInsight: 5 });
            });

            it("should display the number of insights", function() {
                expect(this.view.$(".menus .badge").text().trim()).toBe('5');
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("displays the title", function() {
            expect(this.view.$("h1").text()).toMatchTranslation("dashboard.title.activity");
        });

        it("should have a filter menu", function() {
            expect(this.view.$(".menus .title")).toContainTranslation("filter.show");
            expect(this.view.$(".menus .all")).toContainTranslation("filter.all_activity");
            expect(this.view.$(".menus .insights")).toContainTranslation("filter.only_insights");
        });

        it("displays the 'All Activity' link as active", function() {
            expect(this.view.$(".menus .all")).toHaveClass("active");
            expect(this.view.$(".menus .insights")).not.toHaveClass("active");
        });

        describe("clicking on 'Insights'", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "filter:insights");
                this.view.$(".menus .insights").click();
            });

            it("triggers the 'filter:insights' event on itself", function() {
                expect("filter:insights").toHaveBeenTriggeredOn(this.view);
            });

            it("displays the 'All Insights' option as active", function() {
                expect(this.view.$(".menus .insights")).toHaveClass("active");
                expect(this.view.$(".menus .all")).not.toHaveClass("active");
            });

            it("changes the title to 'Insights'", function() {
                expect(this.view.$("h1").text()).toMatchTranslation("dashboard.title.insights");
            });

            describe("clicking on 'All Activity'", function() {
                beforeEach(function() {
                    spyOnEvent(this.view, "filter:all");
                    this.view.$(".menus .all").click();
                });

                it("triggers the filter:all event on itself", function() {
                    expect("filter:all").toHaveBeenTriggeredOn(this.view);
                });

                it("sets the 'All Activity' option to active", function() {
                    expect(this.view.$(".menus .all")).toHaveClass("active");
                    expect(this.view.$(".menus .insights")).not.toHaveClass("active");
                });

                it("changes the title back to 'Recent Activity'", function() {
                    expect(this.view.$("h1").text()).toMatchTranslation("dashboard.title.activity");
                });
            });
        });
    });
})
