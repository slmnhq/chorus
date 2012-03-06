describe("chorus.views.SearchUserList", function() {
    beforeEach(function() {
        this.collection = fixtures.searchResult().users();
        this.view = new chorus.views.SearchUserList({
            collection: this.collection,
            query: "foo"
        });
        this.collection = this.view.collection;
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
                this.collection.attributes.total = this.collection.models.length + 1;
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
                    expect(chorus.router.navigate).toHaveBeenCalledWith("#/search/user/foo", true);
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

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
            expect(this.view.$('li').length).toBe(4);
        });

        it("has the right data-id attribute", function() {
            expect(""+this.view.$("li").eq(0).data("id")).toBe(this.collection.at(0).get("id"));
            expect(""+this.view.$("li").eq(1).data("id")).toBe(this.collection.at(1).get("id"));
            expect(""+this.view.$("li").eq(2).data("id")).toBe(this.collection.at(2).get("id"));
            expect(""+this.view.$("li").eq(3).data("id")).toBe(this.collection.at(3).get("id"));
        });

        it("includes the correct user icon", function() {
            expect(this.view.$("li img.icon").eq(0).attr("src")).toBe("/edc/userimage/"+ this.collection.at(0).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(1).attr("src")).toBe("/edc/userimage/"+ this.collection.at(1).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(2).attr("src")).toBe("/edc/userimage/"+ this.collection.at(2).get("id") + "?size=icon");
            expect(this.view.$("li img.icon").eq(3).attr("src")).toBe("/edc/userimage/"+ this.collection.at(3).get("id") + "?size=icon");
        });

        it("has a link to the profile for each user in the collection", function() {
            expect(this.view.$('li a.name').eq(0).attr('href')).toBe("#/users/"+this.collection.at(0).get("id"));
            expect(this.view.$('li a.name').eq(1).attr('href')).toBe("#/users/"+this.collection.at(1).get("id"));
            expect(this.view.$('li a.name').eq(2).attr('href')).toBe("#/users/"+this.collection.at(2).get("id"));
            expect(this.view.$('li a.name').eq(3).attr('href')).toBe("#/users/"+this.collection.at(3).get("id"));
        });

        it("has each user's display name (or highlighted display name) in the collection", function() {
            expect(this.view.$('li a.name').eq(0).html()).toContain("John Doe");
            expect(this.view.$('li a.name').eq(1).html()).toContain("<em>Test</em> McTest");
            expect(this.view.$('li a.name').eq(2).html()).toContain("Jack <em>Test</em>");
            expect(this.view.$('li a.name').eq(3).html()).toContain("Sally <em>Test</em>");
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
                    expect(this.view.$("li:eq(0) .moreComments div").length).toBe(2);
                });

                it("display the show-more link", function() {
                    expect(this.view.$(".hasMore")).toContainTranslation("search.comments_more.and");
                    expect(this.view.$(".show_more_comments")).toContainTranslation("search.comments_more.other", {count:2});
                    expect(this.view.$(".show_fewer_comments")).toContainTranslation("search.comments_less");
                });

                it("clicking the show-more link shows the rest of the messages", function() {
                    expect(this.view.$("li:eq(0) .moreComments")).toHaveClass("hidden");
                    expect(this.view.$("li:eq(0) .hasMore")).not.toHaveClass("hidden");

                    this.view.$("li:eq(0) .show_more_comments").click();

                    expect(this.view.$("li:eq(0) .moreComments")).not.toHaveClass("hidden");
                    expect(this.view.$("li:eq(0) .hasMore")).toHaveClass("hidden");
                });

                it("clicking the hide-more link hides the surplus messages and re-enables the more link", function() {
                    this.view.$("li:eq(0) .show_more_comments").click();
                    this.view.$("li:eq(0) .show_fewer_comments").click();

                    expect(this.view.$("li:eq(0) .moreComments")).toHaveClass("hidden");
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
                    expect(this.view.$("li:eq(0) .moreComments div").length).toBe(0);
                });

                it("display the more show more link", function() {
                    expect(this.view.$(".showmoreComments")).not.toExist();
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
                expect(this.view.$('li:eq(3) .username .content').html()).toContain(this.collection.at(3).get("name"));
            });
        });
    });
});