describe("MemberSet", function() {
    describe("#url", function(){
        it("has the workspace id in the url", function(){
            this.workspace = new chorus.models.Workspace({id: 17})
            this.memberSet  = new chorus.models.MemberSet([], {workspaceId: 17})
            expect(this.memberSet.url()).toContain("/edc/workspace/17/member")
        })
    })
});
