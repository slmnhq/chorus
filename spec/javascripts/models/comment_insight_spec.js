describe("chorus.models.CommentInsight", function() {
    beforeEach(function() {
        this.model = new chorus.models.CommentInsight();
    });

    it("should have the right url", function() {
        expect(this.model.url()).toBe("/edc/commentinsight");
    });

    context("with an id and action", function() {
        beforeEach(function() {
            this.model = new chorus.models.CommentInsight({ id: '41', action: "promote" });
        });

        it("has the right url", function() {
            expect(this.model.url()).toBe("/edc/commentinsight/41/promote");
        });
    });

    context("when the action is 'count'", function() {
        beforeEach(function() {
            this.model = new chorus.models.CommentInsight({action: "count"});
        });

        it("should have the correct url", function() {
            expect(this.model.url()).toBe("/edc/commentinsight/count");
        });
    });
});
