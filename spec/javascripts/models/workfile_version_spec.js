describe("chorus.models.WorkfileVersion", function() {
    describe("canEdit", function() {
        it("returns false when its version is not the current version", function() {
            expect(new chorus.models.WorkfileVersion({workspaceId: 1, workfileId: 2, versionId: 3}).canEdit()).toBeFalsy();
        });

        xit("returns true when its version is the current version", function() {

        });
    });
});