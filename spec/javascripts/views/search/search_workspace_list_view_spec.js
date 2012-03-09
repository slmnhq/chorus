describe("chorus.views.SearchWorkspaceList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({workspace: {docs: [
            {
                entityType: "workspace",
                id: "10000",
                isDeleted: false,
                isPublic: false,
                lastUpdatedStamp: "2012-02-24 16:08:32",
                name: "ws",
                description: "ws <i>other text</i>",
                owner: {
                    firstName: "EDC",
                    id: "InitialUser",
                    lastName: "Admin"
                },
                comments: [
                    {
                        "lastUpdatedStamp": "2012-03-08 09:57:46",
                        "isPublished": false,
                        "content": "good version",
                        "isComment": false,
                        "id": "10020",
                        "workspaceId": "10000",
                        "isInsight": false,
                        "highlightedAttributes": {"content": ["good <em>version<\/em>"]},
                        "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}
                    }
                ],
                highlightedAttributes: {
                    name: "<em>ws</em>",
                    description: "<em>ws</em> <i>other text</i>"
                }
            }
        ]}});

        this.result.set({query: "foo"});
        this.models = this.result.workspaces();
        this.models.attributes.total = 3;
        this.view = new chorus.views.SearchWorkspaceList({ collection: this.models, query: this.result });
        this.view.render()
    });

    context("unfiltered results", function() {
        describe("details bar", function() {
            it("has a title", function() {
                expect(this.view.$(".details .title")).toContainTranslation("workspaces.title");
            });

            it("has a long count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "1", total: "3"});
            });

            it("has a showAll link", function() {
                expect(this.view.$('.details a.show_all')).not.toBeEmpty();
                expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
                expect(this.view.$(".details a.show_all").data("type")).toBe("workspace");
            })

            context("clicking the show all link", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    this.view.$("a.show_all").click();
                });

                it("should navigate to the workspace results page", function() {
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
                });
            });

            context("has no additional results", function() {
                beforeEach(function() {
                    this.view = new chorus.views.SearchWorkspaceList({
                        collection: fixtures.workspaceSet([
                            {id: "1", workspace: {id: "2", name: "Test"}},
                            {id: "4", workspace: {id: "3", name: "Other"}}
                        ], { total: "2"})
                    });

                    it("has a short count", function() {
                        expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: "2"});
                    });

                    it("has no showAll link", function() {
                        expect(this.view.$(".details a.show_all")).not.toExist();
                    })
                })
            })

            context("has no results at all", function() {
                beforeEach(function() {
                    this.view = new chorus.views.SearchWorkspaceList({
                        collection: fixtures.workspaceSet([], {total: "0"})
                    });

                    this.view.render()
                });

                it("does not show the bar or the list", function() {
                    expect(this.view.$(".details")).not.toExist();
                    expect(this.view.$("ul")).not.toExist();
                });
            })
        });
    });

    context("filtered results", function() {
        beforeEach(function() {
            this.result.set({entityType: "workspace"});
            this.view.render();
        });

        describe("pagination bar", function() {
            it("has a count of total results", function() {
                expect(this.view.$('.pagination .count')).toContainTranslation("search.results", {count: 3})
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
        });
    });

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
            expect(this.view.$('li').length).toBe(1);
        });
    });
});
