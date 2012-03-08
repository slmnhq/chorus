describe("chorus.views.SearchTabularDataList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.result.set({query: "foo"});
        this.models = this.result.tabularData();
        this.view = new chorus.views.SearchTabularDataList({collection: this.models, query: this.result});
        this.view.render();
    });

    context("with no results", function() {
        beforeEach(function() {
            this.view = new chorus.views.SearchTabularDataList({
                collection: new chorus.collections.Base()
            });

            this.view.render()
        });

        it("does not show the bar or the list", function() {
            expect(this.view.$(".details")).not.toExist();
            expect(this.view.$("ul")).not.toExist();
        });
    })

    context("unfiltered results", function() {
        describe("the details bar", function() {
            it("should have a title", function() {
                    expect(this.view.$(".title")).toContainTranslation("dataset.title_plural");
                });

                it("should show the number of results", function() {
                    expect(this.view.$(".count")).toContainTranslation("search.count", {shown: this.models.length, total: this.models.attributes.total});
                    expect(this.view.$(".show_all")).toExist();
                });

                context("clicking the show all link", function() {
                    beforeEach(function() {
                        spyOn(chorus.router, "navigate");
                        this.view.$("a.show_all").click();
                    });

                    it("should navigate to the user results page", function() {
                        expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
                    });
                });
        });
    });

    context("filtered results", function() {
        beforeEach(function() {
            this.result.set({entityType: "dataset"});
            this.view.render();
        });

        describe("pagination bar", function() {
            it("has a count of total results", function() {
                expect(this.view.$('.pagination .count')).toContainTranslation("search.results", {count: 39})
            });

            it("has a next button", function() {
                expect(this.view.$('.pagination a.next')).toExist();
            });

            it("has a previous button", function() {
                expect(this.view.$('.pagination a.previous')).toExist();
            });
        });
    });

    describe("the 'found in workspaces' section", function() {
        beforeEach(function() {
            this.models.at(0).set({workspaces: [
                {
                    id: 10000,
                    name: "Foo"
                },
                {
                    id: 10010,
                    name: "Bar"
                },
                {
                    id: 10011,
                    name: "Baz"
                }
            ]});
            this.fakeQtip = stubQtip();
            this.view.render();
        });

        it("should display a link to the first workspace", function() {
            expect(this.view.$("li:eq(0) .location .found_in")).toContainTranslation("workspaces_used_in.body.other", {
                workspaceLink: "Foo",
                otherWorkspacesMenu: "2 other workspaces"
            });
        });

        it("should attach an instance to the database and instance links", function() {
            expect(this.view.$("li:eq(0) a.instance, a.database").data("instance")).toBe(this.models.at(0).get("instance"));
        });
    });

    context("when the search results include a chorus view", function() {
        beforeEach(function() {
            this.models.reset([ fixtures.searchResultChorusView({ workspace: { name: "Chorus View Thing" } }) ]);
            this.view.render();
        });

        it("should display a link to the single workspace", function() {
            expect(this.view.$("li:eq(0) .location .found_in")).toContainTranslation("workspaces_used_in.body.one", {
                workspaceLink: "Chorus View Thing"
            });
        });
    });

    context("when there are three or fewer results", function() {
        beforeEach(function() {
            this.models = new chorus.collections.TabularDataSet([
                fixtures.tabularDataJson(),
                fixtures.tabularDataJson()
            ]);
            this.view = new chorus.views.SearchTabularDataList({collection: this.models});
            this.view.render();
        });

        it("should show the short count", function() {
            expect(this.view.$(".count")).toContainTranslation('search.count_short', {shown: 2});
            expect(this.view.$(".show_all")).not.toExist();
        });
    });

    it("renders an li for each model", function() {
        expect(this.view.$("li").length).toBe(10);
    });

    it("displays the items name", function() {
        expect(this.view.$("li:eq(0) .name")).toContainText(this.models.at(0).get("objectName"));
    });

    it("displays a link to the item", function() {
        expect(this.view.$("li:eq(0) .name")).toHaveAttr("href", this.models.at(0).showUrl());
    });

    it("displays an icon for the item", function() {
        var img = this.view.$("li:eq(0) .icon");
        expect(img).toExist();
        expect(img).toHaveAttr("src", this.models.at(0).iconUrl())
        expect(img).toHaveAttr("title", Handlebars.helpers.humanizedTabularDataType(this.models.at(0).attributes))
    });

    context("for a chorus view", function() {
        beforeEach(function() {
            expect(this.models.at(1).get("datasetType")).toBe('CHORUS_VIEW');
        });

        it("links to the correct dataset url", function() {
            expect(this.view.$('li:eq(1) .name').attr('href')).toMatch(/workspace/);
        })
    });
});
