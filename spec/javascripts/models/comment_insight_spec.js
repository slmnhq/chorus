describe("chorus.models.CommentInsight", function() {
    beforeEach(function() {
        this.model = new chorus.models.CommentInsight({ id: '41', action: "promote" });
    });

    it("has the right url", function() {
        expect(this.model.url()).toBe("/edc/commentinsight/41/promote");
    });
});
