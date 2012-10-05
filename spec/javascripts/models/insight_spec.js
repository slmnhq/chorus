describe("chorus.models.Insight", function() {
    beforeEach(function() {
        this.model = new chorus.models.Insight({workspaceId: 5});
    });

    it("should be a note", function() {
        expect(this.model).toBeA(chorus.models.Note);
    });

    it("has isInsight set to true", function() {
        expect(this.model.get('isInsight')).toBe(true);
    });

    it("has the right urlTemplate for attachments", function() {
        expect(this.model.urlTemplate({ isFile: true })).toBe("notes/{{id}}/attachments");
    });
});
