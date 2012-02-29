describe("chorus.views.SearchWorkfileList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SearchWorkfileList({
            collection: fixtures.workfileSet([
                {id: "1", workspace: {id: "2", name: "Test"}, fileType: "SQL",
                    comments: [
                        {"lastUpdatedStamp": "2012-02-28 14:07:34", "isPublished": false, "id": "10000", "workspaceId": "10000", "isInsight": false, "content": "nice <em>cool<\/em> file", "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                        {"lastUpdatedStamp": "2012-02-28 14:07:46", "isPublished": false, "id": "10001", "workspaceId": "10000", "isInsight": false, "content": "nice <em>cool<\/em> comment", "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                        {"lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10002", "workspaceId": "10000", "isInsight": true, "content": "Nice <em>cool<\/em> insight", "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                        {"lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10003", "workspaceId": "10000", "isInsight": true, "content": "Nice <em>cool<\/em> insight", "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}}
                    ]
                },
                {id: "4", workspace: {id: "3", name: "Other"}, fileType: "txt",
                    description: "this is a <EM>cool</EM> file description",
                }
            ]),
            total: "24"
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
            expect(this.view.$("li .found_in_workspace:eq(0) a").attr('href')).toBe('#/workspaces/2');
            expect(this.view.$("li .found_in_workspace:eq(1) a").attr('href')).toBe('#/workspaces/3');

            expect(this.view.$('li .found_in_workspace').eq(0)).toContainTranslation(
                "search.found_in_workspace",
                {workspaceLink: "Test"}
            )
            expect(this.view.$('li .found_in_workspace').eq(1)).toContainTranslation(
                "search.found_in_workspace",
                {workspaceLink: "Other"}
            )
        })

        it("shows matching description if any", function() {
            expect(this.view.$("li .description .description_content").eq(0)).toBeEmpty();
            expect(this.view.$("li .description .description_content").eq(1)).toContainText("this is a cool file description");
        });

        it("shows associated comments/notes/insights", function() {
            expect(this.view.$('li .comments').eq(0).find('.comment').length).toBe(3);
            expect(this.view.$('li .comments').eq(1).find('.comment').length).toBe(0);

            expect(this.view.$('li .comments').eq(0).find('.hasMore a.hasMoreLink')).toContainTranslation("search.comments_more", {count: 1});

            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(0)).toContainTranslation("activity_stream.comment");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(1)).toContainTranslation("activity_stream.comment");
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_type').eq(2)).toContainTranslation("insight.title");

            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(0).html()).toContain(this.view.collection.models[0].get("comments")[0].content);
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(1).html()).toContain(this.view.collection.models[0].get("comments")[1].content);
            expect(this.view.$('li .comments').eq(0).find('.comment .comment_content').eq(2).html()).toContain(this.view.collection.models[0].get("comments")[2].content);
        });

        it("shows the rest of the comments/notes/insights when the user clicks the link", function() {
            expect(this.view.$('li').eq(0).find('.moreComments')).toHaveClass("hidden");

            this.view.$('li .comments').eq(0).find('.hasMore a.hasMoreLink').click();
            expect(this.view.$('li .comments').eq(0).find('.hasMore a.hasMoreLink')).toHaveClass("hidden");

            expect(this.view.$('li').eq(0).find('.moreComments')).not.toHaveClass("hidden");
        });

        it("hides the rest of the comments/notes/insights when the user clicks the 'less' link", function() {
            this.view.$('li .comments').eq(0).find('.hasMore a.hasMoreLink').click();
            this.view.$('li .comments').eq(0).find('a.lessComments').click();

            expect(this.view.$('li').eq(0).find('.moreComments')).not.toHaveClass("hidden");
            expect(this.view.$('li .comments').eq(0).find('.hasMore a.hasMoreLink')).toHaveClass("hidden");
        });

    });
});
