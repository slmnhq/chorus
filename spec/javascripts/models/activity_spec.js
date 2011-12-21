describe("chorus.models.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    describe("#author", function() {
        it("creates a user", function() {
            expect(this.model.author().displayName()).toBe("EDC Admin");
        });

        it("returns the same instance when called multiple times", function() {
            expect(this.model.author()).toBe(this.model.author());
        });
    });

    describe("#comments", function() {
        beforeEach(function() {
            this.model.set({
                comments: [{
                    text: "I'm cold.'",
                    author : fixtures.authorJson(),
                    timestamp : "2011-12-15 12:34:56"
                }],
            });
            this.model.set({id: 5});
            this.comments = this.model.comments();
        });

        it("returns a CommentSet", function() {
            expect(this.comments instanceof chorus.models.CommentSet).toBeTruthy();
        });

        it("memoizes", function() {
            expect(this.comments).toBe(this.model.comments());
        });

        it("contains the activity item's comments", function() {
            var commentsJson = this.model.get("comments");
            expect(this.comments.models[0].get("text")).toBe(commentsJson[0].text);
            expect(this.comments.models[0].get("timestamp")).toBe(commentsJson[0].timestamp);
            expect(this.comments.models[0].creator().get("firstName")).toBe(commentsJson[0].author.firstName);
        });
    });
});
