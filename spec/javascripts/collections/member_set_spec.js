describe("chorus.collections.MemberSet", function() {
    beforeEach(function() {
        this.workspace = new chorus.models.Workspace({id: 17})
        this.memberSet = new chorus.collections.MemberSet([], {workspaceId: 17})
    });

    describe("#url", function() {
        it("has the workspace id in the url", function() {
            expect(this.memberSet.url()).toContain("/workspaces/17/members")
        })
    })

    describe("#save", function() {
        beforeEach(function() {
            spyOnEvent(this.memberSet, 'saved');
            spyOnEvent(this.memberSet, 'saveFailed');
            this.user1 = new chorus.models.User({ username: "niels", id: "1" });
            this.user2 = new chorus.models.User({ username: "ludwig", id: "2" });
            this.user3 = new chorus.models.User({ username: "isaac", id: "4" });
            this.memberSet.add([this.user1, this.user2, this.user3]);
            this.memberSet.save();
        });

        it("does a PUT", function() {
            expect(this.server.requests[0].method).toBe("PUT");
        });

        it("hits the url for the members api", function() {
            expect(this.server.requests[0].url).toBe(this.memberSet.url());
        });

        it("passes a list of user names as data", function() {
            expect(this.server.requests[0].requestBody).toBe("members=1&members=2&members=4");
        });

        context("when the request succeeds", function() {
            beforeEach(function() {
                this.server.completeUpdateFor(this.memberSet);
            });

            it("triggers the 'saved' event on the member set", function() {
                expect("saved").toHaveBeenTriggeredOn(this.memberSet);
            })
        })

        context("when the request fails", function() {
            beforeEach(function() {
                this.server.lastUpdateFor(this.memberSet).failUnprocessableEntity();
            });

            it("triggers the 'saveFailed' event on the member set", function() {
                expect("saveFailed").toHaveBeenTriggeredOn(this.memberSet);
            })
        })
    });
});
