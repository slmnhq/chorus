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

        it("has the right data-cid attribute", function() {
            expect(this.view.$("li").eq(0).data("cid")).toBe(this.collection.at(0).cid);
            expect(this.view.$("li").eq(1).data("cid")).toBe(this.collection.at(1).cid);
            expect(this.view.$("li").eq(2).data("cid")).toBe(this.collection.at(2).cid);
        });

        it("includes the correct user icon", function() {
            expect(this.view.$("li img.icon").eq(0).attr("src")).toBe("/edc/userimage/"+ this.collection.at(0).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(1).attr("src")).toBe("/edc/userimage/"+ this.collection.at(1).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(2).attr("src")).toBe("/edc/userimage/"+ this.collection.at(2).get("id") + "?size=icon");
        });

        it("has a link to the profile for each user in the collection", function() {
            expect(this.view.$('li a.name').eq(0).attr('href')).toBe("#/users/"+this.collection.at(0).get("id"));
            expect(this.view.$('li a.name').eq(1).attr('href')).toBe("#/users/"+this.collection.at(1).get("id"));
            expect(this.view.$('li a.name').eq(2).attr('href')).toBe("#/users/"+this.collection.at(2).get("id"));
        });

        it("has each user's display name (or highlighted display name) in the collection", function() {
            expect(this.view.$('li a.name').eq(0).html()).toContain("John Doe");
            expect(this.view.$('li a.name').eq(1).html()).toContain("<em>Test</em> McTest");
            expect(this.view.$('li a.name').eq(2).html()).toContain("Jack <em>Test</em>");
        });

        describe("supporting messages (title, notes, etc.)", function() {
            context("when there are more than 3 supporting messages", function() {
                beforeEach(function() {
                    this.collection.at(0).set({
                        "admin": "false",
                        "comments": [],
                        "emailAddress": "test@emc.com",
                        "entityType": "user",
                        "firstName": "John",
                        "id": "10023",
                        "isDeleted": "false",
                        "lastName": "Doe",
                        "lastUpdatedStamp": "2012-03-01 11:07:13",
                        "name": "test",
                        "title": "affd",
                        "ou": "Test",
                        "content": "Hello",
                        "owner": {},
                        highlightedAttributes: {
                            "name": "<em>test</em>",
                            "ou": "<em>Test</em>"
                        }
                    });
                    this.view.render();
                });

                it("displays 3 messages in the supporting message and the rest in the more section", function() {
                    expect(this.view.$("li:eq(0) .supportingMessage div").length).toBe(3);
                    expect(this.view.$("li:eq(0) .more_comments div").length).toBe(2);
                });

                it("display the show-more link", function() {
                    expect(this.view.$(".has_more_comments")).toContainTranslation("search.comments_more.and");
                    expect(this.view.$(".show_more_comments")).toContainTranslation("search.comments_more.other", {count:2});
                    expect(this.view.$(".show_fewer_comments")).toContainTranslation("search.comments_less");
                });

                it("clicking the show-more link shows the rest of the messages", function() {
                    expect(this.view.$("li:eq(0) .more_comments")).toHaveClass("hidden");
                    expect(this.view.$("li:eq(0) .has_more_comments")).not.toHaveClass("hidden");

                    this.view.$("li:eq(0) .show_more_comments").click();

                    expect(this.view.$("li:eq(0) .more_comments")).not.toHaveClass("hidden");
                    expect(this.view.$("li:eq(0) .has_more_comments")).toHaveClass("hidden");
                });

                it("clicking the hide-more link hides the surplus messages and re-enables the more link", function() {
                    this.view.$("li:eq(0) .show_more_comments").click();
                    this.view.$("li:eq(0) .show_fewer_comments").click();

                    expect(this.view.$("li:eq(0) .more_comments")).toHaveClass("hidden");
                    expect(this.view.$("li:eq(0) .show_more_comments")).not.toHaveClass("hidden");
                });

                it("uses the highlighted attributes when available", function() {
                    expect(this.view.$("li:eq(0) .title").html()).toContain("affd");
                    expect(this.view.$("li:eq(0) .ou").html()).toContain("<em>Test</em>");
                });
            });

            context("when there are less than 3 supporting messages", function() {
                beforeEach(function() {
                    this.collection.at(0).set({
                        "admin": "false",
                        "comments": [],
                        "emailAddress": "test@emc.com",
                        "entityType": "user",
                        "firstName": "John",
                        "id": "10023",
                        "isDeleted": "false",
                        "lastName": "Doe",
                        "lastUpdatedStamp": "2012-03-01 11:07:13",
                        "name": "<em>test</em>",
                        "content": "",
                        "title": "",
                        "ou": "",
                        "owner": {},
                        "highlightedAttributes" : {}
                    });
                    this.view.render();
                });

                it("displays all messages in the supporting message and none in the rest in the more section", function() {
                    expect(this.view.$("li:eq(0) .supportingMessage div").length).toBe(2);
                    expect(this.view.$("li:eq(0) .more_comments div").length).toBe(0);
                });

                it("display the more show more link", function() {
                    expect(this.view.$(".showmore_comments")).not.toExist();
                });
            });

            it("has each user's Title in the collection", function() {
                expect(this.view.$('li:eq(0) .title .content')).not.toExist();
                expect(this.view.$('li:eq(1) .title .content').html()).toContain("nobody");
                expect(this.view.$('li:eq(2) .title .content').html()).toContain("<em>test</em>er");
                expect(this.view.$('li:eq(3) .title .content')).not.toExist();
            });

            it("has each user's Department in the collection", function() {
                expect(this.view.$('li:eq(0) .ou .content').html()).toContain(this.collection.at(1).get("ou"));
                expect(this.view.$('li:eq(1) .ou .content')).not.toExist();
                expect(this.view.$('li:eq(2) .ou .content')).not.toExist();
                expect(this.view.$('li:eq(3) .ou .content')).not.toExist();
            });

            it("has each user's Notes in the collection", function() {
                expect(this.view.$('li:eq(0) .notes .content').html()).toContain(this.collection.at(0).get("content"));
                expect(this.view.$('li:eq(1) .notes .content').html()).toContain(this.collection.at(1).get("content"));
                expect(this.view.$('li:eq(2) .notes .content')).not.toExist();
                expect(this.view.$('li:eq(3) .notes .content')).not.toExist();
            });

            it("has each user's e-mail in the collection", function() {
                expect(this.view.$('li:eq(0) .email .content')).not.toExist();
                expect(this.view.$('li:eq(1) .email .content').html()).toContain(this.collection.at(1).get("emailAddress"));
                expect(this.view.$('li:eq(2) .email .content').html()).toContain(this.collection.at(2).get("emailAddress"));
                expect(this.view.$('li:eq(3) .email .content')).not.toExist();
            });

            it("has each user's username in the collection", function() {
                expect(this.view.$('li:eq(0) .username .content').html()).toContain(this.collection.at(0).get("name"));
                expect(this.view.$('li:eq(1) .username .content')).not.toExist();
                expect(this.view.$('li:eq(2) .username .content')).not.toExist();
            });
        });
    });
});