describe("chorus.views.SearchWorkfileList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({workfile: {docs: [
            {
                id: "1",
                workspace: {id: "2", name: "Test"},
                fileType: "SQL",
                mimeType: 'text/text',
                comments: [
                    {highlightedAttributes: { "content": "nice <em>cool<\/em> file"   }, "content": "nice cool file", "lastUpdatedStamp": "2012-02-28 14:07:34", "isPublished": false, "id": "10000", "workspaceId": "10000", "isComment": false, "isInsight": false, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                    {highlightedAttributes: { "content": "nice <em>cool<\/em> comment"}, "content": "nice cool comment", "lastUpdatedStamp": "2012-02-28 14:07:46", "isPublished": false, "id": "10001", "workspaceId": "10000", "isComment": true, "isInsight": false, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                    {highlightedAttributes: { "content": "Nice <em>cool<\/em> insight"}, "content": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10002", "workspaceId": "10000", "isComment": false, "isInsight": true, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                    {highlightedAttributes: { "content": "Nice <em>cool<\/em> insight"}, "content": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10003", "workspaceId": "10000", "isComment": false, "isInsight": true, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}}
                ]
            },
            {
                id: "4",
                workspace: {id: "3", name: "Other"},
                fileType: "txt",
                mimeType: 'text/text',
                description: "this is a cool file description",
                highlightedAttributes: {
                    description: "this is a <EM>cool</EM> file description",
                    name: "<em>cool</em> file"
                }
            }
        ]}});

        this.result.set({query: "foo"});
        this.models = this.result.workfiles();
        this.models.attributes.total = 24;
        this.view = new chorus.views.SearchWorkfileList({collection: this.models, query: this.result});
        this.view.render()
    });

    context("unfiltered search results", function() {
        describe("details bar", function() {
            it("has a title", function() {
                expect(this.view.$(".details .title")).toContainTranslation("workfiles.title");
            });

            context("has no additional results", function() {
                beforeEach(function() {
                    var workfiles = fixtures.workfileSet([
                        {id: "1", workspace: {id: "2", name: "Test"}},
                        {id: "4", workspace: {id: "3", name: "Other"}}
                    ], {total: "2"})
                    this.view = new chorus.views.SearchWorkfileList({ collection: workfiles });

                    this.view.render()
                });

                it("has no showAll link", function() {
                    expect(this.view.$(".details a.show_all")).not.toExist();
                })
            })

            context("has additional results", function() {
                it("has a long count", function() {
                    expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "2", total: "24"});
                });

                it("has a showAll link", function() {
                    expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
                    expect(this.view.$(".details a.show_all").data("type")).toBe("workfile");
                })
            })

            context("has no results at all", function() {
                beforeEach(function() {
                    this.view = new chorus.views.SearchWorkfileList({
                        collection: fixtures.workfileSet([], {total: "0"})
                    });

                    this.view.render()
                });

                it("does not show the bar or the list", function() {
                    expect(this.view.$(".details")).not.toExist();
                    expect(this.view.$("ul")).not.toExist();
                });
            })
        })
    })

    context("filtered search", function() {
        beforeEach(function() {
            this.result.set({entityType: "workfile"});
            this.view.render();
        });

        describe("pagination bar", function() {
            it("has a count of total results", function() {
                expect(this.view.$('.pagination .count')).toContainTranslation("search.results", {count: 24})
            });

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
        });
    })


    context("clicking the show all link", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            this.view.$("a.show_all").click();
        });

        it("should navigate to the user results page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
        });
    });

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
            expect(this.view.$('li').length).toBe(2);
        });
    });
});
