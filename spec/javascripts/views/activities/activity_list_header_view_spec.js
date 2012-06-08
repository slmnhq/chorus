describe("chorus.views.ActivityListHeader", function() {
    beforeEach(function() {
        this.workspace = newFixtures.workspace();
        this.collection = this.workspace.activities();

        this.view = new chorus.views.ActivityListHeader({
            model: this.workspace,
            allTitle: "the_all_title_i_passed",
            insightsTitle: "the_insights_title_i_passed"
        });
    });

    it("doesn't re-render when the activity list changes", function() {
        expect(this.view.persistent).toBeTruthy();
    });

    describe("#pickTitle", function() {
        context("with a workspace", function() {
            beforeEach(function() {
                this.workspace = newFixtures.workspace({ name: "a cool workspace" })
                this.view.model = this.workspace;
            });

            it("has the right 'insight' title", function() {
                this.collection.attributes.insights = true;
                expect(this.view.pickTitle()).toBe("a cool workspace");
            });

            it("has the right 'all activities' title", function() {
                this.collection.attributes.insights = false;
                expect(this.view.pickTitle()).toBe("a cool workspace");
            });
        });

        context("without a workspace", function() {
            beforeEach(function() {
                this.view.model = undefined;
            });
            it("has the right 'insight' title", function() {
                this.collection.attributes.insights = true;
                expect(this.view.pickTitle()).toBe("the_insights_title_i_passed");
            });

            it("has the right 'all activities' title", function() {
                this.collection.attributes.insights = false;
                expect(this.view.pickTitle()).toBe("the_all_title_i_passed");
            });
        });
    });

    describe("#setup", function() {
        it("fetches the number of insights", function() {
            expect(this.view.insightCount).toHaveBeenFetched();
        });

        it("configures the insight count for that workspace", function() {
            expect(this.view.insightCount.url()).toContainQueryParams({ workspaceId: this.view.model.get("id") })
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.view.insightCount, { numberOfInsight: 5 });
            });

            it("should display the number of insights", function() {
                expect(this.view.$(".menus .badge").text().trim()).toBe('5');
            });

            describe("#render", function() {
                context("when insights mode is false", function() {
                    it("displays the title for 'all' mode by default", function() {
                        expect(this.view.$("h1")).toContainText(this.view.pickTitle());
                        expect(this.view.$("h1")).toHaveAttr("title", this.view.pickTitle());
                    });

                    it("displays the workspace icon", function() {
                        expect(this.view.$(".title img")).toHaveAttr("src", this.workspace.defaultIconUrl());
                    });

                    context("when insights mode is false", function() {
                        it("displays the 'All Activity' link as active", function() {
                            expect(this.view.$(".menus .all")).toHaveClass("active");
                            expect(this.view.$(".menus .insights")).not.toHaveClass("active");
                        });
                    });

                    context("when insights mode is true", function() {
                        beforeEach(function() {
                            this.view.collection.attributes.insights = true;
                            this.view.render();
                        });

                        it("displays the title for 'insights' mode by default", function() {
                            expect(this.view.$("h1")).toContainText(this.view.pickTitle());
                            expect(this.view.$("h1")).toHaveAttr("title", this.view.pickTitle());
                        });

                        it("displays the 'Insights' link as active", function() {
                            expect(this.view.$(".menus .all")).not.toHaveClass("active");
                            expect(this.view.$(".menus .insights")).toHaveClass("active");
                        });
                    });

                    it("should have a filter menu", function() {
                        expect(this.view.$(".menus .title")).toContainTranslation("filter.show");
                        expect(this.view.$(".menus .all")).toContainTranslation("filter.all_activity");
                        expect(this.view.$(".menus .insights")).toContainTranslation("filter.only_insights");
                    });

                    describe("clicking on 'Insights'", function() {
                        beforeEach(function() {
                            this.view.$(".menus .insights").click();
                        });

                        it("switches the activity set to 'insights' mode and re-fetches it", function() {
                            expect(this.collection.attributes.insights).toBeTruthy();
                            expect(this.collection.attributes.workspace).toBeDefined();
                            expect(this.collection).toHaveBeenFetched();
                        });

                        it("displays the 'All Insights' option as active", function() {
                            expect(this.view.$(".menus .insights")).toHaveClass("active");
                            expect(this.view.$(".menus .all")).not.toHaveClass("active");
                        });

                        it("switches to the title for 'insights' mode", function() {
                            expect(this.view.$("h1")).toContainText(this.view.pickTitle());
                            expect(this.view.$("h1")).toHaveAttr("title", this.view.pickTitle());
                        });

                        describe("clicking on 'All Activity'", function() {
                            beforeEach(function() {
                                this.view.$(".menus .all").click();
                            });

                            it("switches the activity set to 'all' mode (not just insights) and re-fetches it", function() {
                                expect(this.collection.attributes.insights).toBeFalsy();
                                expect(this.collection.attributes.workspace).not.toBeDefined();
                                expect(this.collection).toHaveBeenFetched();
                            });

                            it("sets the 'All Activity' option to active", function() {
                                expect(this.view.$(".menus .all")).toHaveClass("active");
                                expect(this.view.$(".menus .insights")).not.toHaveClass("active");
                            });

                            it("switches back to the title for 'all' mode", function() {
                                expect(this.view.$("h1")).toContainText(this.view.pickTitle());
                                expect(this.view.$("h1")).toHaveAttr("title", this.view.pickTitle());
                            });
                        });
                    });
                });
            });
        });

        describe("when the activity list is reset", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.view.insightCount, { numberOfInsight: 5 });
                this.server.reset();
                this.view.collection.trigger("reset");
            });

            it("fetches the insight count", function() {
                expect(this.view.insightCount).toHaveBeenFetched();
            });

            context("when the fetch completes", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.view.insightCount, { numberOfInsight: 4 });
                });

                it("should display the number of insights", function() {
                    expect(this.view.$(".menus .badge").text().trim()).toBe('4');
                });
            });
        });
    });
});
