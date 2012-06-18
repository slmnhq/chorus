describe("chorus.collections.DatabaseObjectSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatabaseObjectSet([], {
            schemaId: 987
        });
    });

    it("includes the InstanceCredentials mixin", function() {
        expect(this.collection.instanceRequiringCredentials).toBe(chorus.Mixins.InstanceCredentials.model.instanceRequiringCredentials);
    });

    it("extends chorus.collections.LastFetchWins", function() {
        expect(this.collection).toBeA(chorus.collections.LastFetchWins);
    });

    describe("#url", function() {
        it("is correct", function() {
            var url = this.collection.url({ rows: 10, page: 1});
            expect(url).toContainQueryParams({ rows: 10, page: 1, type: "meta" });
            expect(url).toHaveUrlPath("/schemas/987/datasets");
        });

        context("filtering", function() {
            beforeEach(function() {
                this.collection.attributes.filter = "foo";
            });

            it("should include the filter in the url", function() {
                var url = this.collection.url({rows: 10, page: 1});
                expect(url).toHaveUrlPath("/schemas/987/datasets");
                expect(url).toContainQueryParams({ rows: 10, page: 1, filter: "foo" });
            });
        });
    });

    describe("#search", function() {
        it("triggers an API query for the given term", function() {
            this.collection.search("search term");
            expect(this.server.lastFetch().url).toMatchUrl(
                "/schemas/987/datasets?filter=search+term",
                {paramsToIgnore: ["type", "page", "rows"]}
            );
        });

        it("broadcasts 'searched' when API query returns", function() {
            var eventListener = jasmine.createSpy();
            this.collection.bind('searched', eventListener)
            this.collection.search("search term");
            this.server.completeFetchFor(this.collection, []);
            expect(eventListener).toHaveBeenCalled();
        });
    });
});
