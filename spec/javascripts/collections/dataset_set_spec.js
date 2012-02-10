describe("chorus.collections.DatasetSet", function() {
    describe("#url", function() {
        it("is correct", function() {
            var collection = new chorus.collections.DatasetSet([], {workspaceId: 10000});
            expect(collection.url({rows: 10, page: 1})).toMatchUrl("/edc/workspace/10000/dataset?rows=10&page=1");
        });
    });
});