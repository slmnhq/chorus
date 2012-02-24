describe("chorus.views.ActivityListHeader", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.ActivitySet();
        this.view = new chorus.views.ActivityListHeader({
            allTitle: "the_all_title_i_passed",
            insightsTitle: "the_insights_title_i_passed",
            collection: this.collection
        });
        this.insightCount = new chorus.models.CommentInsight.count();
    });

    it("doesn't re-render when the activity list changes", function() {
        expect(this.view.persistent).toBeTruthy();
    });

    describe("#setup", function() {
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

            describe("#render", function() {
                it("displays the title for 'all' mode by default", function() {
                    expect(this.view.$("h1").text()).toBe("the_all_title_i_passed");
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
                        this.view.$(".menus .insights").click();
                    });

                    it("switches the activity set to 'insights' mode and re-fetches it", function() {
                        expect(this.collection.attributes.insights).toBeTruthy();
                        expect(this.collection).toHaveBeenFetched();
                    });

                    it("displays the 'All Insights' option as active", function() {
                        expect(this.view.$(".menus .insights")).toHaveClass("active");
                        expect(this.view.$(".menus .all")).not.toHaveClass("active");
                    });

                    it("switches to the title for 'insights' mode", function() {
                        expect(this.view.$("h1").text()).toBe("the_insights_title_i_passed");
                    });

                    describe("clicking on 'All Activity'", function() {
                        beforeEach(function() {
                            this.view.$(".menus .all").click();
                        });

                        it("switches the activity set to 'all' mode (not just insights) and re-fetches it", function() {
                            expect(this.collection.attributes.insights).toBeFalsy();
                            expect(this.collection).toHaveBeenFetched();
                        });

                        it("sets the 'All Activity' option to active", function() {
                            expect(this.view.$(".menus .all")).toHaveClass("active");
                            expect(this.view.$(".menus .insights")).not.toHaveClass("active");
                        });

                        it("switches back to the title for 'all' mode", function() {
                            expect(this.view.$("h1").text()).toBe("the_all_title_i_passed");
                        });
                    });
                });
            });
        });
    });

    describe("when the activity list is reset", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.insightCount, { numberOfInsight: 5 });
            this.server.reset();
            this.view.collection.trigger("reset");
        });

        it("fetches the insight count", function() {
            expect(this.insightCount).toHaveBeenFetched();
        })

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.insightCount, { numberOfInsight: 4 });
            });

            it("should display the number of insights", function() {
                expect(this.view.$(".menus .badge").text().trim()).toBe('4');
            });
        });
    })
})
