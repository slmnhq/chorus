describe("workfile_set", function() {
    describe("#fetch", function() {
        beforeEach(function() {
            this.collection = new chorus.models.WorkfileSet([], {workspaceId : 1234});
        });

        describe("without filtering", function() {
            it("creates the right URL", function() {
                expect(this.collection.url()).toBe("/edc/workspace/1234/workfile?page=1&rows=50");
            });
        })
        describe("with filtering", function() {
            beforeEach(function() {
                this.collection.attributes.type = "sql"
            })
            it("it has correct Url", function() {
                expect(this.collection.url()).toBe("/edc/workspace/1234/workfile?type=sql&page=1&rows=50");
            })
        })
    });
});