describe("chorus.views.SearchInstanceList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();

        this.result.set({query: "foo"});
        this.models = this.result.instances();
        this.view = new chorus.views.SearchInstanceList({ collection: this.models, total: "24", query: this.result });
        this.view.render()
    });

    describe("details bar", function() {
        it("has a title", function() {
            expect(this.view.$(".details .title")).toContainTranslation("instances.title");
        });

        it("has a long count", function() {
            expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "2", total: "24"});
        });

        it("has a showAll link", function() {
            expect(this.view.$('.details a.show_all')).not.toBeEmpty();
            expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
        })

        context("clicking the show all link", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                this.view.$("a.show_all").click();
            });

            it("should navigate to the instance results page", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
            });
        });

        context("has no additional results", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchInstanceList({
                    collection: new chorus.collections.InstanceSet([fixtures.instance(), fixtures.instance()]),
                    total: "2"
                });

                this.view.render()
            });

            it("has a short count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: "2"});
            });

            it("has no showAll link", function() {
                expect(this.view.$(".details a.show_all")).not.toExist();
            })
        })

        context("has no results at all", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchWorkspaceList({
                    collection: new chorus.collections.InstanceSet(),
                    total: "0"
                });

                this.view.render()
            });

            it("does not show the bar or the list", function() {
                expect(this.view.$(".details")).not.toExist();
                expect(this.view.$("ul")).not.toExist();
            });
        })
    })

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
                expect(this.view.$('li').length).toBe(2);
        });

        it("has the right data-id attribute", function() {
            expect(this.view.$("li").eq(0).data("id")).toBe(10040);
            expect(this.view.$("li").eq(1).data("id")).toBe(10043);
        });

        it("includes the correct instance icon", function() {
            expect($(this.view.$("li img.provider")[0]).attr("src")).toBe("/images/instances/hadoop_instance.png");
            expect($(this.view.$("li img.provider")[1]).attr("src")).toBe("/images/instances/greenplum_instance.png");
        });

        it("includes the correct state icon", function() {
            expect($(this.view.$("li img.state")[0]).attr("src")).toBe("/images/instances/green.png");
            expect($(this.view.$("li img.state")[1]).attr("src")).toBe("/images/instances/red.png");
        });

        it("includes the state text as a title", function() {
            expect($(this.view.$("li img.state")[0]).attr("title")).toBe("Online");
            expect($(this.view.$("li img.state")[1]).attr("title")).toBe("Fault");
        });

        it("shows matching name", function() {
            expect(this.view.$("li .name").eq(0).html()).toContain("<em>my</em>_hadoop");
            expect(this.view.$("li .name").eq(1).html()).toContain("<em>my</em>_instance");
        });
    });
});
