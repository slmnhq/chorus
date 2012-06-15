describe("chorus.collections.DatasetSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([], {workspaceId: 10000});
    });

    it("extends chorus.collections.LastFetchWins", function() {
        expect(this.collection).toBeA(chorus.collections.LastFetchWins);
    });

    describe("#url", function() {
        it("is correct", function() {
            expect(this.collection.url({rows: 10, page: 1})).toMatchUrl("/workspaces/10000/datasets?rows=10&page=1");
        });

        context("with filter type", function() {
            it("appends the filter type", function() {
                this.collection.attributes.type = "SOURCE_TABLE";
                expect(this.collection.url({rows: 10, page: 1})).toContainQueryParams({type: "SOURCE_TABLE", rows: "10", page: "1"});
            });
        });

        it("knows that it does not have a name pattern", function() {
            expect(this.collection.hasFilter()).toBeFalsy();
        });

        context("with name pattern", function() {
            beforeEach(function() {
                this.collection.attributes.namePattern = "Foo";
            });

            it("appends the name pattern", function() {
                expect(this.collection.url({rows: 10, page: 1})).toContainQueryParams({
                    namePattern: "Foo",
                    rows: "10",
                    page: "1"
                });
            });

            it("knows that it has a name pattern", function() {
                expect(this.collection.hasFilter()).toBeTruthy();
            });
        });

        context("with lots of url params", function() {
            it("correctly builds the url", function() {
                this.collection.attributes.type = "SOURCE_TABLE";
                this.collection.attributes.objectType = "TABLE";
                this.collection.attributes.namePattern = "Foo";
                this.collection.attributes.databaseName = "dbName";
                expect(this.collection.url({rows: 10, page: 1})).toContainQueryParams({
                    type: "SOURCE_TABLE",
                    objectType: "TABLE",
                    namePattern: "Foo",
                    databaseName: "dbName",
                    rows: "10",
                    page: "1"
                });
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
