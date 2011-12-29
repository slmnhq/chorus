describe("ListContentDetails", function() {
    beforeEach(function() {
        fixtures.model = "UserSet";
        this.collection = fixtures.modelFor("fetch");
        this.view = new chorus.views.ListContentDetails({ collection : this.collection, modelClass : "User" });
    })

    describe("#render", function() {
        describe("buttons", function() {
            context("with a view", function() {
                beforeEach(function() {
                    this.view.options.buttons = [
                        {
                            view : "WorkspacesNew",
                            text : "Create a Workspace",
                            dataAttributes : [
                                {
                                    name : "foo",
                                    value : "bar"
                                }
                            ]
                        },
                        {
                            url : "#/foo",
                            text : "Create a Foo"
                        }
                    ];

                    this.view.render();
                });

                it("shows the buttons", function() {
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]')).toExist();
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]').text()).toBe("Create a Workspace");
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]')).toHaveData("foo", "bar");

                    expect(this.view.$("a[href=#/foo] button")).toExist();
                    expect(this.view.$("a[href=#/foo] button").text()).toBe("Create a Foo");
                });
            });
        });


        context("when the collection is loaded", function() {
            context("and the hideCounts option is falsy", function() {
                beforeEach(function() {
                    this.view.options.hideCounts = false;
                    this.view.render();
                })

                it("renders the total number of items in the collection", function() {
                    expect(this.view.$(".count .number").text().trim()).toBe("22");
                })
            })

            context("and the hideCounts option is truthy", function() {
                beforeEach(function() {
                    this.view.options.hideCounts = true;
                    this.view.render();
                })

                it("does not render the total number of items in the collection", function() {
                    expect(this.view.$(".count")).not.toExist();
                })

                it("does not render the current page or total page count", function() {
                    expect(this.view.$(".pagination .page")).not.toExist();
                })
            });

            context("and there is only one page of items", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "1";
                    this.view.render();
                })

                it("does not display the pagination controls", function() {
                    expect(this.view.$(".pagination")).not.toExist();
                })

                context("and the hideIfNoPagination option is falsy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = false;
                        this.view.render();
                    })

                    it("does not add the hidden class to the container", function() {
                        expect($(this.view.el)).not.toHaveClass("hidden")
                    })
                })

                context("and the hideIfNoPagination option is truthy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = true;
                        this.view.render();
                    })

                    it("adds the hidden class to the container", function() {
                        expect($(this.view.el)).toHaveClass("hidden")
                    })
                })
            })

            context("and there is more than one page of items", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "2";
                    this.view.render();
                })

                it("displays the pagination controls", function() {
                    expect(this.view.$(".pagination")).toExist();
                })

                it("displays the page number of the collection", function() {
                    expect(this.view.$(".pagination .page .current").text().trim()).toBe(this.collection.pagination.page);
                });

                it("displays the total number of pages in the collection", function() {
                    expect(this.view.$(".pagination .page .total").text().trim()).toBe(this.collection.pagination.total);
                });

                it("does not add the hidden class to the container", function() {
                    expect($(this.view.el)).not.toHaveClass("hidden")
                })

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
                })

            });

            context("and the collection is empty", function() {
                beforeEach(function() {
                    this.view.collection = new chorus.models.UserSet();
                    this.view.render();
                })

                it("does not display the pagination controls", function() {
                    expect(this.view.$(".pagination")).not.toExist();
                })

                context("and the hideIfNoPagination option is falsy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = false;
                        this.view.render();
                    })

                    it("does not add the hidden class to the container", function() {
                        expect($(this.view.el)).not.toHaveClass("hidden")
                    })
                })

                context("and the hideIfNoPagination option is truthy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = true;
                        this.view.render();
                    })

                    it("adds the hidden class to the container", function() {
                        expect($(this.view.el)).toHaveClass("hidden")
                    })
                })
            })
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
            spyOn(window, 'scroll');
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

            it("scrolls the viewport to the top of the page", function() {
                expect(window.scroll).toHaveBeenCalledWith(0, 0)
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

            it("scrolls the viewport to the top of the page", function() {
                expect(window.scroll).toHaveBeenCalledWith(0, 0)
            })
        })
    })
});
