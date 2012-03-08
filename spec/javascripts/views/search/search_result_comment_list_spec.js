describe("chorus.views.SearchResultCommentList", function() {
    beforeEach(function() {
        this.view = new chorus.views.SearchResultCommentList({
            comments: [
                fixtures.searchResultCommentJson({
                    content: "lots o content",
                    highlightedAttributes: {
                        content:["lots o <em>content</em>"]
                    }
                }),
                fixtures.searchResultCommentJson({
                    isComment: true,
                    content: "even more content",
                    highlightedAttributes: {
                        content:["even more <em>content</em>"]
                    }
                }),
                fixtures.searchResultCommentJson({
                    isInsight: true,
                    content: "yet more content",
                    highlightedAttributes: {
                        content:["yet more <em>content</em>"]
                    }
                }),
                fixtures.searchResultCommentJson(),
                fixtures.searchResultCommentJson()
            ]
        });
        this.view.render();
    });

    it("shows the comments", function() {
        expect(this.view.$('.comments > .comment').length).toBe(3);
        expect(this.view.$('.more_comments .comment').length).toBe(2);

        expect(this.view.$('a.show_more_comments')).toContainTranslation("search.comments_more", {count: 2});
        expect(this.view.$('a.show_fewer_comments')).toContainTranslation("search.comments_less", {count: 2});

        var comments = this.view.$('.comments > .comment');
        expect(comments.find('.comment_type').eq(0)).toContainTranslation("activity_stream.note");
        expect(comments.find('.comment_type').eq(1)).toContainTranslation("activity_stream.comment");
        expect(comments.find('.comment_type').eq(2)).toContainTranslation("activity_stream.insight");

        expect(comments.find('.comment_content').eq(0).html()).toContain("lots o <em>content</em>");
        expect(comments.find('.comment_content').eq(1).html()).toContain("even more <em>content</em>");
        expect(comments.find('.comment_content').eq(2).html()).toContain("yet more <em>content</em>");
    });

    context("when the show more comments link is clicked", function() {
        beforeEach(function() {
            this.view.$('a.show_more_comments').click();
        });

        it("shows the remainder of the comments", function() {
            expect(this.view.$('.comments .has_more_comments')).toHaveClass("hidden");
            expect(this.view.$('.comments .more_comments')).not.toHaveClass("hidden");
        });

        context("when the show fewer comments link is clicked", function() {
            beforeEach(function() {
                this.view.$('a.show_fewer_comments').click();
            });

            it("hides the remainder of the comments", function() {
                expect(this.view.$('.comments .has_more_comments')).not.toHaveClass("hidden");
                expect(this.view.$('.comments .more_comments')).toHaveClass("hidden");
            });
        });
    });
});