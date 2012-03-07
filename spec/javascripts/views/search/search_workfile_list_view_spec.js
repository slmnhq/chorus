describe("chorus.views.SearchWorkfileList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SearchWorkfileList({
            collection: fixtures.workfileSet([
                {
                    id: "1",
                    workspace: {id: "2", name: "Test"},
                    fileType: "SQL",
                    mimeType: 'text/text',
                    comments: [
                        {highlightedAttributes: { "content": "nice <em>cool<\/em> file"   }, "content": "nice cool file",    "lastUpdatedStamp": "2012-02-28 14:07:34", "isPublished": false, "id": "10000", "workspaceId": "10000", "isComment": false, "isInsight": false, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                        {highlightedAttributes: { "content": "nice <em>cool<\/em> comment"}, "content": "nice cool comment", "lastUpdatedStamp": "2012-02-28 14:07:46", "isPublished": false, "id": "10001", "workspaceId": "10000", "isComment": true, "isInsight": false,  "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                        {highlightedAttributes: { "content": "Nice <em>cool<\/em> insight"}, "content": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10002", "workspaceId": "10000", "isComment": false, "isInsight": true,  "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                        {highlightedAttributes: { "content": "Nice <em>cool<\/em> insight"}, "content": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10003", "workspaceId": "10000", "isComment": false, "isInsight": true,  "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}}
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
            ]),
            total: "24",
            query: "foo"
        });

        this.view.render()
    });


    describe("details bar", function() {
        it("has a title", function() {
            expect(this.view.$(".details .title")).toContainTranslation("workfiles.title");
        });

        context("has no additional results", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchWorkfileList({
                    collection: fixtures.workfileSet([
                        {id: "1", workspace: {id: "2", name: "Test"}},
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

        context("has additional results", function() {
            it("has a long count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "2", total: "24"});
            });

            it("has a showAll link", function() {
                expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
            })
        })

        context("has no results at all", function() {
            beforeEach(function() {
                this.view = new chorus.views.SearchWorkfileList({
                    collection: fixtures.workfileSet([]),
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

    context("clicking the show all link", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            this.view.$("a.show_all").click();
        });

        it("should navigate to the user results page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("#/search/workfile/foo", true);
        });
    });

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
            expect(this.view.$('li').length).toBe(2);
        });

        it("has the right data-id attribute", function() {
            expect(this.view.$("li").eq(0).data("id")).toBe(1);
            expect(this.view.$("li").eq(1).data("id")).toBe(4);
        });

        it("includes the correct workspace file icon", function() {
            expect($(this.view.$("li img.icon")[0]).attr("src")).toBe("/images/workfiles/large/sql.png");
            expect($(this.view.$("li img.icon")[1]).attr("src")).toBe("/images/workfiles/large/txt.png");
        });

        it("has a link to the workfile for each workfile in the collection", function() {
            expect(this.view.$('li a.name').eq(0).attr('href')).toBe("#/workspaces/2/workfiles/1");
            expect(this.view.$('li a.name').eq(1).attr('href')).toBe("#/workspaces/3/workfiles/4");
        });

        it("shows which workspace each result was found in", function() {
            expect(this.view.$('li .location').eq(0)).toContainTranslation(
                "workspaces_used_in.body.one",
                {workspaceLink: "Test"}
            )
            expect(this.view.$('li .location').eq(1)).toContainTranslation(
                "workspaces_used_in.body.one",
                {workspaceLink: "Other"}
            )
        })

        it("shows matching description if any", function() {
            expect(this.view.$("li .description .description_content").eq(0)).toBeEmpty();
            expect(this.view.$("li .description .description_content").eq(1).html()).toContain("this is a <em>cool</em> file description");
        });

        it("shows matching name", function() {
            expect(this.view.$("li .name").eq(1).html()).toContain("<em>cool</em> file");
        });

        it("shows associated comments/notes/insights", function() {
            expect(this.view.$('li .comments').eq(0).find('.comment').length).toBe(3);
            expect(this.view.$('li .comments').eq(1).find('.comment').length).toBe(0);

            expect(this.view.$('li .comments').eq(0).find('.hasMore a.show_more_comments')).toContainTranslation("search.comments_more", {count: 1});

            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(0)).toContainTranslation("activity_stream.note");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(1)).toContainTranslation("activity_stream.comment");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(2)).toContainTranslation("activity_stream.insight");

            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(0).html()).toContain("nice <em>cool</em> file");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(1).html()).toContain("nice <em>cool</em> comment");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(2).html()).toContain("Nice <em>cool</em> insight");
        });

        it("shows the rest of the comments/notes/insights when the user clicks the link", function() {
            expect(this.view.$('li').eq(0).find('.moreComments')).toHaveClass("hidden");

            this.view.$('li .comments').eq(0).find('.hasMore a.show_more_comments').click();
            expect(this.view.$('li .comments').eq(0).find('.hasMore')).toHaveClass("hidden");

            expect(this.view.$('li').eq(0).find('.moreComments')).not.toHaveClass("hidden");
        });

        it("hides the rest of the comments/notes/insights when the user clicks the 'less' link", function() {
            this.view.$('li .comments').eq(0).find('.hasMore a.show_more_comments').click();
            this.view.$('li .comments').eq(0).find('a.show_fewer_comments').click();

            expect(this.view.$('li').eq(0).find('.moreComments')).not.toHaveClass("hidden");
            expect(this.view.$('li .comments').eq(0).find('.hasMore')).toHaveClass("hidden");
        });

        describe("shows version commit messages in the comments area", function() {
            beforeEach(function() {
                this.view.collection.models[0].set({
                    // TODO: This should be in the highlightedAttributes sub-object.  Fix
                    // after https://www.pivotaltracker.com/story/show/26023235 is done.
                    commitMessage: [
                        "this is a <em>cool</em> version",
                        "this is a <em>cooler</em> version"
                    ]
                });
                this.view.render();
            });

            it("looks correct", function() {
                expect(this.view.$('li:eq(0) .moreComments .comment:eq(2) .comment_type').text().trim()).toBe('');
                expect(this.view.$('li:eq(0) .moreComments .comment:eq(2) .comment_content').html()).toContain("this is a <em>cooler</em> version");
            });
        });
    });
});
