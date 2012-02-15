describe("chorus.models.Insight", function() {
    beforeEach(function() {
        this.model = new chorus.models.Insight({workspaceId: 5});
    });

    it("should be a comment", function() {
        expect(this.model).toBeA(chorus.models.Comment);
    });

    it("includes isInsight=true in its URL params", function() {
        expect(this.model.urlParams().isInsight).toBe(true);
    });
});
