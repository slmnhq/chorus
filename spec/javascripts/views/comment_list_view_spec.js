describe("CommentList", function() {
    beforeEach(function() {
        this.comment1 = fixtures.comment({
            text : "Yes we can",
            author : {
                firstName : "Barack",
                lastName : "Obama",
                id : "45"
            }
        });
        this.comment2 = fixtures.comment({
            text : "No hate plz"
        });
        this.comment3 = fixtures.comment();
        this.comments = new chorus.models.CommentSet([this.comment1, this.comment2, this.comment3]);
        this.view = new chorus.views.CommentList({ collection: this.comments, initialLimit: 2 });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
            this.listItems = this.view.$("li.comment");
        });

        it("displays all the comments", function() {
            expect(this.listItems.length).toBe(3);
        });

        it("displays the time of each comment's creation", function() {
            expect(this.listItems.eq(0).find(".comment_content .timestamp")).toExist();
        });

        it("displays the text of each comment", function() {
            expect(this.listItems.eq(0).find(".body")).toHaveText("Yes we can");
            expect(this.listItems.eq(1).find(".body")).toHaveText("No hate plz");
        })

        it("displays the name of each comment's author", function() {
            expect(this.listItems.eq(0).find("a.author").text()).toBe("Barack Obama");
        });

        it("displays the profile image of each comment's author", function() {
            expect(this.listItems.eq(0).find("img").attr('src')).toBe(this.comment1.creator().imageUrl({ size: "icon" }));
        });

        context("when there are more comments than the specified 'initial limit'", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("displays a 'more' link", function() {
                expect(this.view.$("a.more")).toExist();
            });

            it("applies the 'more' class to the extra elements", function() {
                expect(this.view.$("li:eq(0)")).not.toHaveClass("more");
                expect(this.view.$("li:eq(1)")).not.toHaveClass("more");
                expect(this.view.$("li:eq(2)")).toHaveClass("more");
            });
        });

        context("when there are fewer comments than the specified 'initial limit'", function() {
            beforeEach(function() {
                this.comments.remove(this.comment1);
                expect(this.comments.models.length).toBe(2);
                this.view.render();
            });

            it("does not render a 'more' link", function() {
                expect(this.view.$("a.more")).not.toExist();
            });

            it("applies the 'more' class to the extra elements", function() {
                expect(this.view.$("li.more")).not.toExist();
            });
        });
    });
});
