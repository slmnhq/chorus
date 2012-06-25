describe("chorus.collections.DatasetFilterSet", function() {
    beforeEach(function() {

        this.dataset = newFixtures.workspaceDataset.sourceTable();
        this.columns = this.dataset.columns();
        this.columns.reset([
            fixtures.databaseColumn(),
            fixtures.databaseColumn(),
            fixtures.databaseColumn()
        ]);

        var filter1 = new chorus.models.DatasetFilter({column: this.columns.at(0), comparator: "equal", input: {value: "A"}});
        var filter2 = new chorus.models.DatasetFilter({column: this.columns.at(1), comparator: "not_equal", input: {value: "B"}});

        this.collection = new chorus.collections.DatasetFilterSet([filter1, filter2]);
    });

    describe("#whereClause", function() {
        beforeEach(function() {
            this.collection.remove(this.collection.at(1));
            spyOn(this.collection.at(0), "sqlString").andReturn("foo = 1");
        });

        it("joins the individual filters' conditions", function() {
            expect(this.collection.whereClause()).toBe("WHERE foo = 1");
        });

        describe("when all filterViews return an empty string", function() {
            beforeEach(function() {
                this.collection.at(0).sqlString.andReturn("");
            });

            it("returns an empty string (not 'WHERE ')", function() {
                expect(this.collection.whereClause()).toBe("");
            });
        });
    });

    describe("#count", function() {
        beforeEach(function() {
            this.collection.add(new chorus.models.DatasetFilter());
            spyOn(this.collection.at(0), "sqlString").andReturn("foo = 2");
            spyOn(this.collection.at(1), "sqlString").andReturn("");
            spyOn(this.collection.at(2), "sqlString").andReturn("foo = 4");
        });

        it("eliminates empty filters", function() {
            expect(this.collection.count()).toBe(2);
        });
    });

    describe("#clone", function() {
        beforeEach(function() {
            this.clone = this.collection.clone();
        });
        it("clones the collection", function() {
            expect(this.clone).toBeA(chorus.collections.DatasetFilterSet);
            this.clone.add(new chorus.models.DatasetFilter());
            expect(this.clone.models.length).toBeGreaterThan(this.collection.models.length);
            this.clone.at(0).set({comparator: "not_null"});
            expect(this.collection.at(0).get("comparator")).not.toBe("not_null");
        });
    });
});
