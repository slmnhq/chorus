describe("chorus.collections.CommentSet", function() {
    beforeEach(function() {
        this.workspace = new chorus.models.Workspace({id: 17})
        this.commentSet = new chorus.collections.CommentSet([], {workspaceId: 17})
    });

    describe("#url", function() {
        it("has the workspace id in the url", function() {
            expect(this.commentSet.url()).toContain("/edc/comment/workspace/17");
        });
    });
});
