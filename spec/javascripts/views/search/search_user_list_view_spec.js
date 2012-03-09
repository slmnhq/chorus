describe("chorus.views.SearchUserList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.result.set({query: "foo"});
        this.collection = this.result.users();
        this.view = new chorus.views.SearchUserList({ collection: this.collection, total: 4, query: this.result });
        this.view.render();
    });

    context("unfiltered search results", function() {
        describe("details bar", function() {
            it("has a title", function() {
                expect(this.view.$(".details .title")).toContainTranslation("search.users.title");
            });

            context("has no additional results", function() {
                beforeEach(function() {
                    this.view.collection.attributes.total = this.collection.models.length;
                    this.view.render()
                });

                it("has a short count", function() {
                    expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: this.collection.models.length});
                });

                it("has no showAll link", function() {
                    expect(this.view.$(".details a.show_all")).not.toExist();
                });
            });

            context("has additional results", function() {
                beforeEach(function() {
                    this.view.options.total = this.collection.models.length + 1;
                    this.view.render()
                });

                it("has a long count", function() {
                    expect(this.view.$(".details .count")).toContainTranslation("search.count", {
                        shown: this.collection.models.length,
                        total: (this.collection.models.length + 1)
                    });
                });

                it("has a showAll link", function() {
                    expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
                    expect(this.view.$(".details a.show_all").data("type")).toBe("user");
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

            context("has no results at all", function() {
                beforeEach(function() {
                    this.view = new chorus.views.SearchUserList({
                        collection: fixtures.userSet([], {total: 0})
                    });

                    this.view.render()
                });

                it("does not show the bar or the list", function() {
                    expect(this.view.$(".details")).not.toExist();
                    expect(this.view.$("ul")).not.toExist();
                });
            });
        });
    })

    context("filtered search results", function() {
        beforeEach(function() {
            this.result.set({entityType: "user"});
            this.view.render();
        });

        describe("pagination bar", function() {
            context("when there are two pages of results", function() {
                context("and I am on the first page", function() {
                    beforeEach(function() {
                        spyOn(this.result, "hasPreviousPage").andReturn(false);
                        spyOn(this.result, "hasNextPage").andReturn(true);
                        this.view.render();
                    });

                    it("should have a next link", function() {
                        expect(this.view.$('.pagination a.next')).toExist();
                        expect(this.view.$('.pagination a.next')).toContainTranslation("search.next");
                    });

                    it("should not have a previous link", function() {
                        expect(this.view.$('.pagination a.previous')).not.toExist();
                    });

                    it("should have previous in plain text", function() {
                        expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
                    });

                });

                context("and I am on the second page", function(){
                    beforeEach(function() {
                        spyOn(this.result, "hasNextPage").andReturn(false);
                        spyOn(this.result, "hasPreviousPage").andReturn(true);
                        this.view.render();
                    });

                    it("should have a previous link", function() {
                        expect(this.view.$('.pagination a.previous')).toExist();
                        expect(this.view.$('.pagination a.previous')).toContainTranslation("search.previous");
                    });

                    it("should not have a next link", function() {
                        expect(this.view.$('.pagination a.next')).not.toExist();
                    });

                    it("should have next in plain text", function() {
                        expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                    });



                });
            })

            context("when there is one page of results", function() {
                beforeEach(function() {
                    spyOn(this.result, "hasNextPage").andReturn(false);
                    spyOn(this.result, "hasPreviousPage").andReturn(false);
                    this.view.render();
                });

                it("should not have next and previous links", function() {
                    expect(this.view.$('.pagination a.next')).not.toExist();
                    expect(this.view.$('.pagination a.previous')).not.toExist();
                });

                it("should have next and previous in plain text", function() {
                    expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                    expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
                });
            })

            it("has a count of total results", function() {
                expect(this.view.$('.pagination .count')).toContainTranslation("search.results", {count: 4})
            });
        });
    })

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
            expect(this.view.$('li').length).toBe(3);
        });
    });
});