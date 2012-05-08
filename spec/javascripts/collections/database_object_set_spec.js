describe("chorus.collections.DatabaseObjectSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatabaseObjectSet([], {
            instance_id: '10000', databaseName:"some_database", schemaName: "some_schema"
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
            expect(url).toHaveUrlPath("/data/10000/database/some_database/schema/some_schema");
        });

        context("when the url needs to be encoded", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatabaseObjectSet([], {
                    instance_id: '10000', databaseName: "some%database", schemaName: "some schema"
                });
            });

            it("should encode the url", function() {
                expect(this.collection.url()).toContain("/data/10000/database/some%25database/schema/some%20schema");
            });
        });

        context("filtering", function() {
            beforeEach(function() {
                this.collection.attributes.filter = "foo";
            });

            it("should include the filter in the url", function() {
                var url = this.collection.url({rows: 10, page: 1});
                expect(url).toHaveUrlPath("/data/10000/database/some_database/schema/some_schema");
                expect(url).toContainQueryParams({ rows: 10, page: 1, filter: "foo" });
            });
        });
    });

    describe("#parse", function() {
        beforeEach(function() {
            this.collection.fetch();
            this.server.lastFetchFor(this.collection).succeed([
                { objectName: "brian_the_table" },
                { objectName: "rand_the_table" }
            ]);
        });

        it("sets the instance id, databaseName, and schemaName from the collection on each model", function() {
            expect(this.collection.at(0).get("instance").id).toBe("10000");
            expect(this.collection.at(0).get("databaseName")).toBe("some_database");
            expect(this.collection.at(0).get("schemaName")).toBe("some_schema");

            expect(this.collection.at(1).get("instance").id).toBe("10000");
            expect(this.collection.at(1).get("databaseName")).toBe("some_database");
            expect(this.collection.at(1).get("schemaName")).toBe("some_schema");
        });
    });

    describe("#search", function() {
        it("triggers an API query for the given term", function() {
            this.collection.search("search term");
            expect(this.server.lastFetch().url).toMatchUrl(
                "/data/10000/database/some_database/schema/some_schema?filter=search+term",
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
