describe("chorus.views.ListContentDetails", function() {
    beforeEach(function() {
        this.collection = rspecFixtures.userSet();
        this.collection.pagination = {
            "total": "2",
            "page": "1",
            "records": "22"
        }
        this.collection.loaded = true;
        this.view = new chorus.views.ListContentDetails({ collection: this.collection, modelClass: "User" });
    })

    describe("#render", function() {
        describe("buttons", function() {
            context("with a view", function() {
                beforeEach(function() {
                    this.view.options.buttons = [
                        {
                            view: "WorkspacesNew",
                            text: "Create a Workspace",
                            dataAttributes: [
                                {
                                    name: "foo",
                                    value: "bar"
                                }
                            ]
                        },
                        {
                            url: "#/foo",
                            text: "Create a Foo"
                        }
                    ];

                    this.view.render();
                });

                it("shows the buttons", function() {
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]')).toExist();
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]').text()).toBe("Create a Workspace");
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]')).toHaveData("foo", "bar");

                    expect(this.view.$("a.button[href=#/foo]")).toExist();
                    expect(this.view.$("a.button[href=#/foo]")).toContainText("Create a Foo");
                });
            });
        });

        context("when the multiSelect is falsy", function() {
            beforeEach(function() {
                this.view.options.multiSelect = false;
                this.view.render();
            });

            it("does not show the multi-select section", function() {
                expect(this.view.$(".multiselect")).not.toExist();
            });
        });

        context("when the multiSelect option is true", function() {
            beforeEach(function() {
                this.view.options.search = true;
                this.view.options.multiSelect = true;
                this.view.render();
                spyOn(chorus.PageEvents, "broadcast");
            });

            it("does not show the 'explore' text", function() {
                expect(this.view.$("span.explore")).not.toExist();
            });

            it("should have a 'select all' and 'deselect all'", function() {
                expect(this.view.$(".multiselect span")).toContainTranslation("actions.select");
                expect(this.view.$(".multiselect a.select_all")).toContainTranslation("actions.select_all");
                expect(this.view.$(".multiselect a.select_none")).toContainTranslation("actions.select_none");
            });

            describe("when the 'select all' link is clicked", function() {
                it("broadcasts the 'selectAll' page event", function() {
                    this.view.$(".multiselect a.select_all").click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("selectAll");
                });
            });

            describe("when the 'select none' link is clicked", function() {
                it("broadcasts the 'selectNone' page event", function() {
                    this.view.$(".multiselect a.select_none").click();
                    expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("selectNone");
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
                    expect(this.view.$(".count")).toContainText("22");
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
                    expect(this.view.$(".pagination")).toHaveClass("hidden");
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
                    expect(this.view.$(".pagination")).not.toHaveClass("hidden");
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
                        expect(this.view.$(".pagination .links a.next")).not.toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.next")).toHaveClass("hidden");
                    })
                });

                context("when there is NO next page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    })

                    it("renders the next page link, but not as a link", function() {
                        expect(this.view.$(".pagination .links a.next")).toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.next")).not.toHaveClass("hidden");
                    });
                });

                context("when there is a previous page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    })

                    it("renders the previous page link", function() {
                        expect(this.view.$(".pagination .links a.previous")).not.toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.previous")).toHaveClass("hidden");
                    })
                })

                context("when there is NO previous page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "1";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    })

                    it("renders the previous page link, but not as a link", function() {
                        expect(this.view.$(".pagination .links a.previous")).toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.previous")).not.toHaveClass("hidden");
                    });
                })
            });

            context("and the collection is empty", function() {
                beforeEach(function() {
                    this.view.collection = new chorus.collections.UserSet();
                    this.view.collection.loaded = true;
                    this.view.render();
                })

                it("does not display the pagination controls", function() {
                    expect(this.view.$(".pagination")).toHaveClass("hidden");
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
                expect(window.scroll).toHaveBeenCalledWith(0, 0);
            })
        })
    })

    describe("search", function() {
        beforeEach(function() {
            this.$list = $("<ul/>");
            spyOn(chorus, "search");
            this.view.options.search = {
                list: this.$list,
                placeholder: "SearchPlaceholder"
            };
            this.view.render();
        });

        it("has a default label of 'explore'", function() {
            expect(this.view.$(".explore")).toContainTranslation("actions.explore");
        });

        it("calls chorus.search on the input field", function() {
            expect(chorus.search).toHaveBeenCalledWith(_.extend({
                    input: this.view.$("input.search:text"),
                    afterFilter: jasmine.any(Function)
                },
                this.view.options.search));
        });

        it("doesn't render a search bar if the placeholder key is not present in the search hash", function() {
            delete this.view.options.search.placeholder;
            this.view.render();

            expect(this.view.$("input.search:text")).not.toExist();
        });
    });

    describe("#startLoading", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("shows the loading text in the right place", function() {
            expect(this.view.$(".count")).not.toContainTranslation("loading");
            this.view.startLoading(".count");
            expect(this.view.$(".count")).toContainTranslation("loading");
        });
    });

    context("when it's a dataset list content details view", function() {
        beforeEach(function() {
            this.modalSpy = stubModals();
            this.collection = new chorus.collections.DatasetSet();
            this.collection.attributes.workspaceId = 44;
            this.collection.loaded = true;
            this.view = new chorus.views.ListContentDetails({ collection: this.collection, modelClass: "Dataset" });
            $("#jasmine_content").append(this.view.el);
        });

        describe("when the instance is provisioning", function() {
            beforeEach(function() {
                this.view.provisioningState = "provisioning";
                this.view.render();
            });

            it("shows a grey bar below the title", function() {
                expect(this.view.$(".provisioning_bar")).not.toHaveClass("hidden");
                expect(this.view.$(".provisioning_fault_bar")).toHaveClass("hidden");
                expect(this.view.$(".provisioning_bar")).toContainTranslation("dataset.content_details.provisioning");
                expect(this.view.$(".provisioning_bar .actions a.close_provisioning")).toContainTranslation("actions.close");
            });

            describe("user clicks 'close'", function() {
                beforeEach(function() {
                    this.view.$(".provisioning_bar .actions a.close_provisioning").click();
                });

                it("removes the bar", function() {
                    expect(this.view.$(".provisioning_bar")).toHaveClass("hidden");
                });
            });
        });

        describe("when the instance provisioning failed", function() {
            beforeEach(function() {
                this.view.provisioningState = "fault";
                this.view.render();
            });

            it("shows a red bar below the title", function() {
                expect(this.view.$(".provisioning_fault_bar")).not.toHaveClass("hidden");
                expect(this.view.$(".provisioning_bar")).toHaveClass("hidden");
                expect(this.view.$(".provisioning_fault_bar")).toContainTranslation("dataset.content_details.provisioning_fault");
                expect(this.view.$(".provisioning_fault_bar .actions a.close_provisioning")).toContainTranslation("actions.close");
            });

            it("shows the retry link", function() {
                expect(this.view.$(".provisioning_fault_bar .actions a.retry_provisioning")).toContainTranslation("actions.retry");
                expect(this.view.$(".provisioning_fault_bar .actions a.retry_provisioning")).toHaveClass("dialog");
                expect(this.view.$(".provisioning_fault_bar .actions a.retry_provisioning").data("dialog")).toBe("SandboxNew");
                expect(this.view.$(".provisioning_fault_bar .actions a.retry_provisioning").data("workspace-id")).toBe(44);
            });

            describe("user clicks 'close'", function() {
                beforeEach(function() {
                    this.view.$(".provisioning_fault_bar .actions a.close_provisioning").click();
                });

                it("removes the bar", function() {
                    expect(this.view.$(".provisioning_fault_bar")).toHaveClass("hidden");
                });
            });
        });
    })
});
