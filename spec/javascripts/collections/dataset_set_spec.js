describe("chorus.collections.DatasetSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([], {workspaceId: 10000});
    });

    it("extends chorus.collections.LastFetchWins", function() {
        expect(this.collection).toBeA(chorus.collections.LastFetchWins);
    });

    describe("#url", function() {
        it("is correct", function() {
            expect(this.collection.url({rows: 10, page: 1})).toMatchUrl("/workspace/10000/dataset?rows=10&page=1");
        });

        context("with filter type", function() {
            it("appends the filter type", function() {
                this.collection.attributes.type = "SOURCE_TABLE";
                expect(this.collection.url({rows: 10, page: 1})).toContainQueryParams({type: "SOURCE_TABLE", rows: "10", page: "1"});
            });
        });

        context("with name pattern", function() {
            it("appends the name pattern", function() {
                this.collection.attributes.namePattern = "Foo";
                expect(this.collection.url({rows: 10, page: 1})).toContainQueryParams({
                    namePattern: "Foo",
                    rows: "10",
                    page: "1"
                });
            });
        });

        context("with lots of url params", function() {
            it("correctly builds the url", function() {
                this.collection.attributes.type = "SOURCE_TABLE";
                this.collection.attributes.objectType = "BASE_TABLE";
                this.collection.attributes.namePattern = "Foo";
                this.collection.attributes.databaseName = "dbName";
                expect(this.collection.url({rows: 10, page: 1})).toContainQueryParams({
                    type: "SOURCE_TABLE",
                    objectType: "BASE_TABLE",
                    namePattern: "Foo",
                    databaseName: "dbName",
                    rows: "10",
                    page: "1"
                });
            });
        });

        context("when the url needs to be encoded", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatasetSet([], {
                    instanceId: 10000, databaseName: "%foo%", schemaName: " bar "
                });
            });

            it("should encode the url", function() {
                expect(this.collection.url()).toContain("/data/10000/database/%25foo%25/schema/%20bar%20");
            });
        });
    });

    describe("sorting", function() {
        context("without a sorting override", function() {
            beforeEach(function() {
                this.collection.add(newFixtures.dataset.sandboxTable({objectName: 'zTable'}));
                this.collection.add(newFixtures.dataset.sandboxTable({objectName: 'aTable'}));
            });

            it("sorts by objectName", function() {
                expect(this.collection.at(0).get("objectName")).toBe("aTable");
                expect(this.collection.at(1).get("objectName")).toBe("zTable");
            });
        });

        context("with a sorting override", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.DatasetSet([], {workspaceId: 10000, unsorted: true});
                this.collection.add(newFixtures.dataset.sandboxTable({objectName: 'zTable'}));
                this.collection.add(newFixtures.dataset.sandboxTable({objectName: 'aTable'}));
            });

            it("does not sort", function() {
                expect(this.collection.at(0).get("objectName")).toBe("zTable");
                expect(this.collection.at(1).get("objectName")).toBe("aTable");
            });
        });
    });
});
