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
                expect(this.view.$(".show_all").data("type")).toBe("dataset");
            });

            context("clicking the show all link", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    this.view.$("a.show_all").click();
                });

                it("should navigate to the tabular data results page", function() {
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

                    it("should have the 'Page x of y' text", function() {
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
});
