describe("chorus.models.Insight", function() {
    beforeEach(function() {
        this.model = new chorus.models.Insight({workspaceId: 5});
    });

    it("should be a comment", function() {
        expect(this.model).toBeA(chorus.models.Comment);
    });

    it("has isInsight set to true", function() {
        expect(this.model.get('isInsight')).toBe(true);
    });
});
