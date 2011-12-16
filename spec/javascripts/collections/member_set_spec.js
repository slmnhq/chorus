describe("MemberSet", function() {
    beforeEach(function() {
        this.workspace = new chorus.models.Workspace({id: 17})
        this.memberSet  = new chorus.models.MemberSet([], {workspaceId: 17})
    });

    describe("#url", function(){
        it("has the workspace id in the url", function(){
            expect(this.memberSet.url()).toContain("/edc/workspace/17/member")
        })
    })

    describe("#save", function() {
        beforeEach(function() {
            this.user1 = new chorus.models.User({ userName: "niels" });
            this.user2 = new chorus.models.User({ userName: "ludwig" });
            this.user3 = new chorus.models.User({ userName: "isaac" });
            this.memberSet.add([this.user1, this.user2, this.user3]);
        });

        it("does a PUT", function() {
            this.memberSet.save()
            expect(this.server.requests[0].method).toBe("PUT");
        });

        it("hits the url for the members api", function() {
            this.memberSet.save()
            expect(this.server.requests[0].url).toBe(this.memberSet.url());
        });

        it("passes a list of user names as data", function() {
            this.memberSet.save()
            expect(this.server.requests[0].requestBody).toBe("members=niels&members=ludwig&members=isaac");
        });
    });
});
