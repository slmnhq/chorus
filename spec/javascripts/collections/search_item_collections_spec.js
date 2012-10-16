describe("chorus.collections.Search", function() {
    beforeEach(function() {
        this.search = fixtures.searchResult({
            instances: {
                numFound: 131,
                results: [
                    chorus.Mixins.Fetching.camelizeKeys(rspecFixtures.greenplumInstanceJson({ response: { name: "instance101", id: '101' } }).response),
                    chorus.Mixins.Fetching.camelizeKeys(rspecFixtures.greenplumInstanceJson({ response: { name: "instance102", id: '102' } }).response),
                    chorus.Mixins.Fetching.camelizeKeys(rspecFixtures.greenplumInstanceJson({ response: { name: "instance103", id: '103' } }).response),
                    chorus.Mixins.Fetching.camelizeKeys(rspecFixtures.greenplumInstanceJson({ response: { name: "instance104", id: '104' } }).response),
                    chorus.Mixins.Fetching.camelizeKeys(rspecFixtures.greenplumInstanceJson({ response: { name: "instance105", id: '105' } }).response)
                ]
            }
        });

        this.collection = new chorus.collections.Search.InstanceSet([], {search: this.search})
    });

    describe("#refreshFromSearch", function() {
        beforeEach(function() {
            var collection = this.collection;
            this.spy = jasmine.createSpy("resetSpy").andCallFake(function() {
                expect(collection.pagination.records).toBe(131);
                expect(collection.pagination.total).toBe(3);
                expect(collection.pagination.page).toBe(1);
            });
            this.collection.bind("reset", this.spy);
            this.collection.refreshFromSearch();
        });

        it("populates the collection with the right data from the search", function() {
            expect(this.collection.length).toBe(5);
            expect(this.collection.at(0).id).toBe('101');
            expect(this.collection.at(1).id).toBe('102');
            expect(this.collection.at(2).id).toBe('103');
            expect(this.collection.at(3).id).toBe('104');
            expect(this.collection.at(4).id).toBe('105');
        });

        it("sets the collection's pagination information correctly, *before* triggering a reset", function() {
            expect(this.spy).toHaveBeenCalled();
            this.spy();
        });
    });

    describe("#fetchPage", function() {
        beforeEach(function() {
            this.collection.fetchPage(5);
        });

        it("fetches the correct page of search results", function() {
            expect(this.server.lastFetch().url).toBe(this.search.url({ page: 5 }));
        });

        it("refreshes the collection on success", function() {
            this.server.completeFetchFor(this.search, new chorus.models.SearchResult({
                instances: {
                    numFound: 51,
                    results: [
                        rspecFixtures.greenplumInstanceJson({ response: { name: "instance121", id: '121' } }).response,
                        rspecFixtures.greenplumInstanceJson({ response: { name: "instance122", id: '122' } }).response,
                        rspecFixtures.greenplumInstanceJson({ response: { name: "instance123", id: '123' } }).response
                    ]
                }}));

            expect(this.collection.pagination.records).toBe(51);
            expect(this.collection.length).toBe(3);
            expect(this.collection.at(0).get("id")).toBe("121");
            expect(this.collection.at(1).get("id")).toBe("122");
            expect(this.collection.at(2).get("id")).toBe("123");
        });
    });
});
