describe("chorus.views.SearchTabularDataList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.models = this.result.tabularData();
        this.view = new chorus.views.SearchTabularDataList({collection: this.models});
        this.view.render();
    });

    it("should have a title", function() {
        expect(this.view.$(".title")).toContainTranslation("dataset.title_plural");
    });

    it("should show the number of results", function() {
        expect(this.view.$(".count")).toContainTranslation("search.count", {shown: this.models.length, total: this.models.attributes.total});
    });

    context("when there are three or fewer results", function() {
        beforeEach(function() {
            this.models = new chorus.collections.TabularDataSet([
                fixtures.tabularDataJson(),
                fixtures.tabularDataJson()
            ]);
            this.view = new chorus.views.SearchTabularDataList({collection: this.models});
            this.view.render();
        });

        it("should show the short count", function() {
            expect(this.view.$(".count")).toContainTranslation('search.count_short', {shown: 2});
        });
    });

    it("renders an li for each model", function() {
        expect(this.view.$("li").length).toBe(10);
    });

    it("displays the items name", function() {
        expect(this.view.$("li:eq(0) .name")).toContainText(this.models.at(0).get("objectName"));
    });

    it("displays a link to the item", function() {
        expect(this.view.$("li:eq(0) .name")).toHaveAttr("href", this.models.at(0).showUrl());
    });

    context("for a chorus view", function() {
        beforeEach(function() {
            expect(this.models.at(1).get("datasetType")).toBe('CHORUS_VIEW');
        });

        it("links to the correct dataset url", function() {
            expect(this.view.$('li:eq(1) .name').attr('href')).toMatch(/workspace/);
        })
    });

    context("when the results include comments", function() {
        beforeEach(function() {
            this.models.at(0).set({comments: [
                fixtures.commentJson({
                    content: "Comment content #1"
                }),
                fixtures.commentJson({
                    content: "Comment content #2"
                }),
                fixtures.commentJson({
                    content: "Comment content #3"
                }),
                fixtures.commentJson({
                    content: "Comment content #4"
                })
            ]});
            this.view.render();
            $("#jasmine_content").append(this.view.el);
        });

        it("renders the first three comments in the tabular data search results", function() {
            var visibleComments = this.view.$("li:eq(0) .comment:visible");
            expect(visibleComments.length).toBe(3);
            expect(visibleComments.eq(0).find(".comment_content")).toContainText("Comment content #1");
            expect(visibleComments.eq(1).find(".comment_content")).toContainText("Comment content #2");
            expect(visibleComments.eq(2).find(".comment_content")).toContainText("Comment content #3");
        });

        it("should have a link to display more comments", function() {
            expect(this.view.$('li:eq(0) a.more_comments')).toContainTranslation("search.comments_more", {count: 1});
        });

        context("when the display more comments link is clicked", function() {
            beforeEach(function() {
                this.view.$("li:eq(0) a.more_comments").click();
            });

            it("display the remainder of the comments", function() {
                var visibleComments = this.view.$("li:eq(0) .comment:visible");
                expect(visibleComments.length).toBe(4);
            });

            it("should have a link to display fewer comments, and hide the 'more comments' link", function() {
                expect(this.view.$('li:eq(0) a.fewer_comments')).toContainTranslation("search.comments_less");
                expect(this.view.$('li:eq(0) a.more_comments')).toBeHidden();
            });

            context("clicking the fewer comments link", function() {
                beforeEach(function() {
                    this.view.$("li:eq(0) a.fewer_comments").click();
                });

                it("should hide the remainder of the comments", function() {
                    var visibleComments = this.view.$("li:eq(0) .comment:visible");
                    expect(visibleComments.length).toBe(3);
                });

                it("should show the 'more comments' link", function() {
                    expect(this.view.$('li:eq(0) a.more_comments')).toBeVisible();
                });
            });
        });

        context("when there are fewer than three matching comments", function() {
            beforeEach(function() {
                this.models.at(0).set({comments: [
                    fixtures.commentJson({
                        content: "Another content #1"
                    }),
                    fixtures.commentJson({
                        content: "Another content #4"
                    })
                ]});
                this.view.render();
            });

            it("should not have a link to display more comments", function() {
                expect(this.view.$("li:eq(0) a.more_comments")).not.toExist();
            });
        });
    });
});
