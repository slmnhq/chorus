describe("chorus.views.SearchResultHeader", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.result.set({query: "foo"});
        this.collection = this.result.users();
        this.view = new chorus.views.SearchResultHeader({ collection: this.collection, query: this.result, entityType: "user"});
    });

    context("when there are three or fewer results", function() {
        beforeEach(function() {
            this.models = new chorus.collections.TabularDataSet([
                fixtures.tabularDataJson(),
                fixtures.tabularDataJson()
            ]);
            this.view = new chorus.views.SearchResultHeader({collection: this.models, query: this.result, entityType: "dataset"});
            this.view.render();
        });

        it("should show the short count", function() {
            expect(this.view.$(".count")).toContainTranslation('search.count_short', {shown: 2});
            expect(this.view.$(".show_all")).not.toExist();
        });
    });

    context("unfiltered search results", function() {
        beforeEach(function() {
            this.view.render();
        });

        describe("details bar", function() {
            it("has a title", function() {
                expect(this.view.$(".details .title")).toContainTranslation("search.users.title");
            });

            context("has no additional results", function() {
                beforeEach(function() {
                    this.collection.attributes.total = this.collection.models.length;
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

                    it("should navigate to the appropriate results page", function() {
                        expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
                    });
                });
            });

            context("has no results at all", function() {
                beforeEach(function() {
                    this.view = new chorus.views.SearchResultListBase({
                        collection: fixtures.userSet([], {total: 0}),
                        entityType: "user"
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

        describe("next and previous buttons", function() {
            context("when I click next", function() {
                beforeEach(function() {
                    spyOn(this.result, "hasNextPage").andReturn(true);
                    this.view.render();
                    spyOn(this.view, "render");

                    this.view.$('.pagination a.next').click();
                });

                it("should set the page to 2", function() {
                    expect(this.result.get("page")).toBe(2);
                });

                it("should fetch the second page of results", function() {
                    expect(this.server.lastFetch().url).toMatchUrl("/edc/search/global/?query=foo&entityType=user&rows=50&page=2")
                })

                it("should re-render", function() {
                    expect(this.view.render).toHaveBeenCalled();
                });

            })

            context("when I click previous", function() {
                beforeEach(function() {
                    spyOn(this.result, "hasPreviousPage").andReturn(true);
                    this.view.render();
                    spyOn(this.view, "render");
                    this.result.set({page: 2});
                    this.view.$('.pagination a.previous').click();
                });

                it("should set the page to 1", function() {
                    expect(this.result.get("page")).toBe(1);
                });

                it("should fetch the first page of results", function() {
                    expect(this.server.lastFetch().url).toMatchUrl("/edc/search/global/?query=foo&entityType=user&rows=50&page=1")
                })

                it("should re-render", function() {
                    expect(this.view.render).toHaveBeenCalled();
                });
            });
        });


        describe("pagination bar", function() {
            context("when there are two pages of results", function() {
                beforeEach(function() {
                    spyOn(this.result, "totalPageNumber").andReturn(2);
                });

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

                    it ("should have the 'Page x of y' text", function (){
                        expect(this.view.$('.pagination span.page_numbers')).toExist();
                        expect(this.view.$('.pagination span.page_numbers')).toContainTranslation("search.page", {shown: 1, total: 2})
                    });
                });

                context("and I am on the second page", function() {
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


                it ("should not have the 'Page x of y' text", function (){
                    expect(this.view.$('.pagination span.page_numbers')).not.toExist();
                });
            })

            it("has a count of total results", function() {
                expect(this.view.$('.count')).toContainTranslation("search.results", {count: 4})
            });
        });
    })

});