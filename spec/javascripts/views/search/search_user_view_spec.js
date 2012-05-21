describe("chorus.views.SearchUser", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.model = this.result.users().models[0];
        this.model.set({
            highlightedAttributes: {
                title: '<em>test</em>er',
                email: '<em>test</em>@example.com',
                firstName: "<em>John</em>",
                ou: "<em>John</em>",
                content: "<em>Here is some content</em>",
                name: "<em>foo</em>"
            },
            image: { icon: "bar" }
        })
        this.view = new chorus.views.SearchUser({ model: this.model });
        this.view.render();
    });

    it("includes the user icon", function() {
        expect(this.view.$("img.icon").attr("src")).toBe(this.model.fetchImageUrl({size: "icon"}));
    });

    it("has a link to the profile", function() {
        expect(this.view.$('a.name').attr('href')).toBe("#/users/"+this.model.get("id"));
    });

    it("has the display name (or highlighted display name)", function() {
        expect(this.view.$('a.name').html()).toContain("<em>John</em> Doe");
    });

    it("has the title", function() {
        expect(this.view.$('.title .content').html()).toContain("<em>test</em>er");
    });

    describe("supporting messages (title, notes, etc.)", function() {
        it("has Department", function() {
            expect(this.view.$('.ou .content').html()).toContain("<em>John</em>");
        });

        it("has Notes", function() {
            expect(this.view.$('.notes .content').html()).toContain("<em>Here is some content</em>");
        });

        it("has e-mail", function() {
            expect(this.view.$('.email .content').html()).toContain('<em>test</em>@example.com');
        });

        it("has username", function() {
            expect(this.view.$('.username .content').html()).toContain("<em>foo</em>");
        });

        context("when there are more than 3 supporting messages", function() {
            beforeEach(function() {
                this.model.set({
                    "admin": "false",
                    "comments": [],
                    "email": "test@emc.com",
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
                        "ou": "<em>Test</em>",
                        "title": "<em>affd</em>",
                        "firstName": "<em>affd</em>",
                        "email": "<em>test</em>@emc.com",
                        "content": "<em>Hello</em>"
                    }
                });
                this.view = new chorus.views.SearchUser({ model: this.model, search: this.result });
                this.view.render();
            });

            it("displays 3 messages in the supporting message and the rest in the more section", function() {
                expect(this.view.$(".supporting_message div").length).toBe(3);
                expect(this.view.$(".more_comments div").length).toBe(1);
            });

            it("display the show-more link", function() {
                expect(this.view.$(".has_more_comments")).toContainTranslation("search.comments_more.and");
                expect(this.view.$(".show_more_comments")).toContainTranslation("search.comments_more.one", {count:1});
                expect(this.view.$(".show_fewer_comments")).toContainTranslation("search.comments_less");
            });

            it("clicking the show-more link shows the rest of the messages", function() {
                expect(this.view.$(".more_comments")).toHaveClass("hidden");
                expect(this.view.$(".has_more_comments")).not.toHaveClass("hidden");

                this.view.$(".show_more_comments").click();

                expect(this.view.$(".more_comments")).not.toHaveClass("hidden");
                expect(this.view.$(".has_more_comments")).toHaveClass("hidden");
            });

            it("clicking the hide-more link hides the surplus messages and re-enables the more link", function() {
                this.view.$(".show_more_comments").click();
                this.view.$(".show_fewer_comments").click();

                expect(this.view.$(".more_comments")).toHaveClass("hidden");
                expect(this.view.$(".show_more_comments")).not.toHaveClass("hidden");
            });

            it("uses the highlighted attributes when available", function() {
                expect(this.view.$(".title").html()).toContain("affd");
                expect(this.view.$(".ou").html()).toContain("<em>Test</em>");
            });
        });

        context("when there are less than 3 supporting messages", function() {
            beforeEach(function() {
                this.model.set({
                    "admin": "false",
                    "comments": [],
                    "email": "test@emc.com",
                    "entityType": "user",
                    "firstName": "John",
                    "id": "10023",
                    "isDeleted": "false",
                    "lastName": "Doe",
                    "lastUpdatedStamp": "2012-03-01 11:07:13",
                    "name": "test",
                    "content": "",
                    "title": "",
                    "ou": "",
                    "owner": {},
                    "highlightedAttributes" : {
                        name: "<em>test</em>"
                    }
                });
                this.view.render();
            });

            it("displays all messages in the supporting message and none in the rest in the more section", function() {
                expect(this.view.$(".supporting_message div").length).toBe(1);
                expect(this.view.$(".more_comments div").length).toBe(0);
            });

            it("display the more show more link", function() {
                expect(this.view.$(".showmore_comments")).not.toExist();
            });
        });
    });
});
