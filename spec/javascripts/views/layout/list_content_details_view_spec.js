describe("ListContentDetails", function() {
    beforeEach(function() {
        this.loadTemplate("list_content_details")
        fixtures.model = "UserSet";
        this.collection = fixtures.modelFor("fetch");
        this.view = new chorus.views.ListContentDetails({ collection : this.collection, modelClass : "User" });
    })

    describe("#render", function() {
        context("when the collection is loaded", function() {
            beforeEach(function() {
                this.view.render();
            })

            it("renders the total number of items in the collection", function() {
                expect(this.view.$(".count .number").text().trim()).toBe(this.collection.pagination.records);
            })

            it("displays the page number of the collection", function() {
                expect(this.view.$(".pagination .page .current").text().trim()).toBe(this.collection.pagination.page);
            });

            it("displays the total number of pages in the collection", function() {
                expect(this.view.$(".pagination .page .total").text().trim()).toBe(this.collection.pagination.total);
            });

            context("when there is a next page", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "2";
                    this.view.render();
                })

                it("renders the next page link", function() {
                    expect(this.view.$(".pagination .links a.next")).toExist();
                    expect(this.view.$(".pagination .links span.next")).not.toExist();
                })
            });

            context("when there is NO next page", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "2";
                    this.collection.pagination.total = "2";
                    this.view.render();
                })
                
                it("renders the next page link, but not as a link", function() {
                    expect(this.view.$(".pagination .links a.next")).not.toExist();
                    expect(this.view.$(".pagination .links span.next")).toExist();
                });
            });

            context("when there is a previous page", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "2";
                    this.collection.pagination.total = "2";
                    this.view.render();
                })

                it("renders the previous page link", function() {
                    expect(this.view.$(".pagination .links a.previous")).toExist();
                    expect(this.view.$(".pagination .links span.previous")).not.toExist();
                })
            })

            context("when there is NO previous page", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "2";
                    this.view.render();
                })

                it("renders the previous page link, but not as a link", function() {
                    expect(this.view.$(".pagination .links a.previous")).not.toExist();
                    expect(this.view.$(".pagination .links span.previous")).toExist();
                });
            });
        })

        context("when the collection is not loaded", function() {
            beforeEach(function() {
                this.collection.loaded = undefined;
                this.view.render();
            })

            it("displays 'loading'", function() {
                expect(this.view.$(".loading")).toExist();
            })
        })
    });

    describe("clicking the pagination links", function() {
        beforeEach(function() {
            this.collection.pagination.page = "2";
            this.collection.pagination.total = "3";
            this.view.render();
        })

        describe("when the 'next' link is clicked", function() {
            beforeEach(function() {
                spyOn(this.collection, "fetchPage");
                this.view.$("a.next").click();
            });

            it("fetches the next page of the collection", function() {
                expect(this.collection.fetchPage).toHaveBeenCalledWith(3);
            })
        })

        describe("when the 'previous' link is clicked", function() {
            beforeEach(function() {
                spyOn(this.collection, "fetchPage");
                this.view.$("a.previous").click();
            });

            it("fetches the previous page of the collection", function() {
                expect(this.collection.fetchPage).toHaveBeenCalledWith(1);
            })
        })
    })
});