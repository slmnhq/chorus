describe("chorus.collections.WorkfileSet", function() {
    describe("#fetch", function() {
        beforeEach(function() {
            this.collection = new chorus.collections.WorkfileSet([], {workspaceId : 1234});
        });

        describe("without filtering", function() {
            it("creates the right URL", function() {
                expect(this.collection.url()).toBe("/workspace/1234/workfile?page=1&rows=50");
            });
        })
        describe("with filtering", function() {
            beforeEach(function() {
                this.collection.attributes.fileType = "sql"
            })
            it("it has correct Url", function() {
                expect(this.collection.url()).toBe("/workspace/1234/workfile?fileType=sql&page=1&rows=50");
            })
        })
        describe("with sorting", function() {
            beforeEach(function() {
                this.collection.attributes.fileType = "sql"
                this.collection.sortAsc("name")
            })
            it("it has correct Url", function() {
                expect(this.collection.url()).toBe("/workspace/1234/workfile?fileType=sql&page=1&rows=50&sidx=name&sord=asc");
            })
        })
    });
});
