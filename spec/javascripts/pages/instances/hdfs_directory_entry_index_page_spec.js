describe("chorus.pages.HdfsDirectoryEntryIndexPage", function() {
    beforeEach(function() {

        this.page = new chorus.pages.HdfsDirectoryEntryIndexPage("1234", "foo");
    });

    it("fetches something for that directory", function() {
        expect(this.page.collection).toHaveBeenFetched();
    })

    describe("when the fetch completes", function() {
        beforeEach(function() {
            var entries = fixtures.hdfsDirectoryEntrySetJson({instanceId: "1234", path: "/foo"});
            this.server.completeFetchFor(this.page.collection, entries);
        });
    })
})