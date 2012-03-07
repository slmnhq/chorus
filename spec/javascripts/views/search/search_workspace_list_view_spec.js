describe("chorus.views.SearchWorkspaceList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({workspace: {docs: [
            {
                comments: [
                    { highlightedAttributes: {content: "<em>yay0</em>"}, content: "yay0", id: "10061", isComment: false, isInsight: false, isPublished: false, lastUpdatedStamp: "2012-02-28 11:10:28", owner: { firstName: "EDC", id: "InitialUser", lastName: "Admin" }, workspaceId: "10000" },
                    { highlightedAttributes: {content: "<em>yay1</em>"}, content: "yay1", id: "10062", isComment: false, isInsight: false, isPublished: false, lastUpdatedStamp: "2012-02-28 11:10:28", owner: { firstName: "EDC", id: "InitialUser", lastName: "Admin" }, workspaceId: "10000" },
                    { highlightedAttributes: {content: "<em>yay2</em>"}, content: "yay2", id: "10063", isComment: false, isInsight: false, isPublished: false, lastUpdatedStamp: "2012-02-28 11:10:28", owner: { firstName: "EDC", id: "InitialUser", lastName: "Admin" }, workspaceId: "10000" },
                    { highlightedAttributes: {content: "<em>yay3</em>"}, content: "yay3", id: "10064", isComment: false, isInsight: false, isPublished: false, lastUpdatedStamp: "2012-02-28 11:10:28", owner: { firstName: "EDC", id: "InitialUser", lastName: "Admin" }, workspaceId: "10000" }
                ],
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
                highlightedAttributes: {
                    name: "<em>ws</em>",
                    description: "<em>ws</em> <i>other text</i>"
                }
            }
        ]}});

        this.result.set({query: "foo"});
        this.models = this.result.workspaces();
        this.view = new chorus.views.SearchWorkspaceList({ collection: this.models, total: "24", query: this.result });
        this.view.render()
    });

    describe("details bar", function() {
        it("has a title", function() {
            expect(this.view.$(".details .title")).toContainTranslation("workspaces.title");
        });

        it("has a long count", function() {
            expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "1", total: "24"});
        });

        it("has a showAll link", function() {
            expect(this.view.$('.details a.show_all')).not.toBeEmpty();
            expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
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

        context("has no additional results", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchWorkspaceList({
                    collection: fixtures.workspaceSet([
                        {id: "1",  workspace: {id: "2", name: "Test"}},
                        {id: "4", workspace: {id: "3", name: "Other"}}
                    ]),

                    total: "2"
                });

                this.view.render()
            });

            it("has a short count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: "2"});
            });

            it("has no showAll link", function() {
                expect(this.view.$(".details a.show_all")).not.toExist();
            })
        })

        context("has no results at all", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchWorkspaceList({
                    collection: fixtures.workspaceSet([]),
                    total: "0"
                });

                this.view.render()
            });

            it("does not show the bar or the list", function() {
                expect(this.view.$(".details")).not.toExist();
                expect(this.view.$("ul")).not.toExist();
            });
        })
    })

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
                expect(this.view.$('li').length).toBe(1);
        });

        it("has the right data-id attribute", function() {
            expect(this.view.$("li").eq(0).data("id")).toBe(10000);
        });

        it("includes the correct workspace file icon", function() {
            expect($(this.view.$("li img.icon")[0]).attr("src")).toBe("/edc/workspace/10000/image?size=original");
        });

        it("has a link to the workspace for each workspace in the collection", function() {
            expect(this.view.$('li a.name').eq(0).attr('href')).toBe("#/workspaces/10000");
        });

        it("shows matching description if any", function() {
            expect(this.view.$("li .description .description_content").eq(0).html()).toContain("<em>ws</em> <i>other text</i>");
        });

        it("shows matching name", function() {
            expect(this.view.$("li .name").eq(0).html()).toContain("<em>ws</em>");
        });

        it("shows associated comments/notes/insights", function() {
            expect(this.view.$('li .comments').eq(0).find('.comment').length).toBe(3);

            expect(this.view.$('li .comments').eq(0).find('a.show_more_comments')).toContainTranslation("search.comments_more", {count: 1});

            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(0)).toContainTranslation("activity_stream.note");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(1)).toContainTranslation("activity_stream.note");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(2)).toContainTranslation("activity_stream.note");

            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(0).html()).toContain("<em>yay0</em>");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(1).html()).toContain("<em>yay1</em>");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(2).html()).toContain("<em>yay2</em>");
        });

        it("shows the rest of the comments/notes/insights when the user clicks the link", function() {
            expect(this.view.$('li').eq(0).find('.moreComments')).toHaveClass("hidden");

            this.view.$('li .comments').eq(0).find('a.show_more_comments').click();
            expect(this.view.$('li .comments').eq(0).find('.hasMore')).toHaveClass("hidden");

            expect(this.view.$('li').eq(0).find('.moreComments')).not.toHaveClass("hidden");
        });

        it("hides the rest of the comments/notes/insights when the user clicks the 'less' link", function() {
            this.view.$('li .comments').eq(0).find('a.show_more_comments').click();
            this.view.$('li .comments').eq(0).find('a.show_fewer_comments').click();

            expect(this.view.$('li').eq(0).find('.moreComments')).not.toHaveClass("hidden");
            expect(this.view.$('li .comments').eq(0).find('.hasMore')).toHaveClass("hidden");
        });

    });
});
