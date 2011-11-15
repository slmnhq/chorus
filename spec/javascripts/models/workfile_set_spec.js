describe("workfile_set", function(){
    describe("#fetch", function(){
        beforeEach(function(){
            this.collection = new chorus.models.WorkfileSet([], {workspaceId : 1234});
        });

        it("creates the right URL", function(){
            expect(this.collection.url()).toBe("/edc/workspace/1234/workfile");
        });
    });
});