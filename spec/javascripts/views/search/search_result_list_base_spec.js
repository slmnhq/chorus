describe("chorus.views.SearchResultListBase", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.result.set({ query: "foo" });

        var instances = this.result.instances();
        instances.attributes.total = 24;

        this.view = new chorus.views.SearchResultListBase({
            entityType: "instance",
            collection: instances,
            query: this.result
        });

        this.view.render();
    });

    it("has a list element for each model in the collection", function() {
        expect(this.view.$('li').length).toBe(2);
    });

    context("filtered search", function() {
        beforeEach(function() {
            this.result.set({ entityType: "instance" });
            this.view.render();
        });

        it("has a count of total results", function() {
            expect(this.view.$('.pagination .count')).toContainTranslation("search.results", {count: 24})
        });

        context("when there is one page of results", function() {
            beforeEach(function() {
                spyOn(this.result, "hasNextPage").andReturn(false);
                spyOn(this.result, "hasPreviousPage").andReturn(false);
                this.view.render();
            });

            it("does not have next and previous links", function() {
                expect(this.view.$('.pagination a.next')).not.toExist();
                expect(this.view.$('.pagination a.previous')).not.toExist();
            });

            it("has 'next' and 'previous' in plain text", function() {
                expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
            });

            it ("does not have the 'Page x of y' text", function (){
                expect(this.view.$('.pagination span.page_numbers')).not.toExist();
            });
        });

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

                it("has a next link", function() {
                    expect(this.view.$('.pagination a.next')).toExist();
                    expect(this.view.$('.pagination a.next')).toContainTranslation("search.next");
                });

                it("has a previous link", function() {
                    expect(this.view.$('.pagination a.previous')).not.toExist();
                });

                it("has 'previous' in plain text", function() {
                    expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
                });

                it("has the 'Page x of y' text", function (){
                    expect(this.view.$('.pagination span.page_numbers')).toExist();
                    expect(this.view.$('.pagination span.page_numbers')).toContainTranslation("search.page", {shown: 1, total: 2})
                });

                context("when I click next", function() {
                    beforeEach(function() {
                        spyOn(this.view, "render");

                        this.view.$('.pagination a.next').click();
                    });

                    it("sets the page to 2", function() {
                        expect(this.result.get("page")).toBe(2);
                    });

                    it("fetches the second page of results", function() {
                        expect(this.server.lastFetch().url).toMatchUrl("/edc/search/global/?query=foo&entityType=instance&rows=50&page=2")
                    })

                    it("re-renders", function() {
                        expect(this.view.render).toHaveBeenCalled();
                    });
                })
            });

            context("and I am on the second page", function(){
                beforeEach(function() {
                    spyOn(this.result, "hasNextPage").andReturn(false);
                    spyOn(this.result, "hasPreviousPage").andReturn(true);
                    this.view.render();
                });

                it("does not have a 'next' link", function() {
                    expect(this.view.$('.pagination a.next')).not.toExist();
                });

                it("has 'next' in plain text", function() {
                    expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                });

                it("has a 'previous' link", function() {
                    expect(this.view.$('.pagination a.previous')).toExist();
                    expect(this.view.$('.pagination a.previous')).toContainTranslation("search.previous");
                });

                context("when I click previous", function() {
                    beforeEach(function() {
                        spyOn(this.view, "render");
                        this.result.set({page: 2});
                        this.view.$('.pagination a.previous').click();
                    });

                    it("sets the page to 1", function() {
                        expect(this.result.get("page")).toBe(1);
                    });

                    it("fetches the first page of results", function() {
                        expect(this.server.lastFetch().url).toMatchUrl("/edc/search/global/?query=foo&entityType=instance&rows=50&page=1")
                    })

                    it("re-renders", function() {
                        expect(this.view.render).toHaveBeenCalled();
                    });
                });
            });
        });
    });

    context("unfiltered search", function() {
        it("has a title", function() {
            expect(this.view.$(".details .title")).toContainTranslation("instances.title");
        });

        context("when there are additional results", function() {
            it("has a long count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "2", total: "24"});
            });

            it("has a showAll link", function() {
                expect(this.view.$('.details a.show_all')).not.toBeEmpty();
                expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
                expect(this.view.$(".details a.show_all").data("type")).toBe("instance");
            })

            context("clicking the show all link", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    this.view.$("a.show_all").click();
                });

                it("navigates to the instance results page", function() {
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
                });
            });
        });

        context("when there are no additional results", function() {
            beforeEach(function() {
                this.view.collection.reset([fixtures.instance(), fixtures.instance()]);
                this.view.collection.attributes.total = "2";
                this.view.render()
            });

            it("has a short count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: "2"});
            });

            it("has no showAll link", function() {
                expect(this.view.$(".details a.show_all")).not.toExist();
            })
        });

        context("when there are no results at all", function() {
            beforeEach(function() {
                this.view.collection.reset();
                this.view.collection.attributes.total = "0";
                this.view.render()
            });

            it("does not show the bar or the list", function() {
                expect(this.view.$(".details")).not.toExist();
                expect(this.view.$("ul")).not.toExist();
            });
        });
    });
});
