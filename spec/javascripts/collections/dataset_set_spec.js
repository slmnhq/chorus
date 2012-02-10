describe("chorus.collections.DatasetSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([], {workspaceId: 10000});
    });
    describe("#url", function() {
        it("is correct", function() {
            expect(this.collection.url({rows: 10, page: 1})).toMatchUrl("/edc/workspace/10000/dataset?rows=10&page=1");
        });

        context("with filter type", function() {
            it("appends the filter type", function() {
                this.collection.attributes.type = "SOURCE_TABLE"
                expect(this.collection.url({rows: 10, page: 1})).toMatchUrl("/edc/workspace/10000/dataset?type=SOURCE_TABLE&rows=10&page=1");
            })
        })
    });
});