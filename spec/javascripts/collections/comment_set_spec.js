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

    describe("comparator", function() {
        it("orders them by timestamp", function() {
            this.commentSet.add(fixtures.comment({timestamp: '2011-01-01 13:00:00'}));
            this.commentSet.add(fixtures.comment({timestamp: '2011-01-01 11:00:00'}));
            this.commentSet.add(fixtures.comment({timestamp: '2011-01-01 12:00:00'}));
            expect(this.commentSet.at(0).get('timestamp')).toBe('2011-01-01 11:00:00');
            expect(this.commentSet.at(1).get('timestamp')).toBe('2011-01-01 12:00:00');
            expect(this.commentSet.at(2).get('timestamp')).toBe('2011-01-01 13:00:00');
        });
    });
});
