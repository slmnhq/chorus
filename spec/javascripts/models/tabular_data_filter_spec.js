describe("chorus.models.TabularDataFilter", function() {
    beforeEach(function() {
        this.model = new chorus.models.TabularDataFilter();
        this.column = fixtures.databaseColumn({parentName: "Mom"});
        this.column.tabularData = fixtures.tabularData({ objectName: "Mom"});
        this.model.set({column: this.column, comparator: "someComparator", input: {value: "one"}});
    });

    describe("#setColumn", function() {
        context("when the column is the same as the current column", function() {
            it("keeps the cid, comparator, and values the same", function() {
                this.model.setColumn(this.column);
                expect(this.model.get("comparator")).toBe("someComparator");
                expect(this.model.get("input")).toEqual({value: "one"});
            });
        });

        context("when the column is different from the current column", function() {
            it("changes the column and clears the comparator and values", function() {
                var column = fixtures.databaseColumn();
                this.model.setColumn(column);
                expect(this.model.get("column").attributes).toEqual(column.attributes);
                expect(this.model.get("comparator")).toBeUndefined();
                expect(this.model.get("input")).toBeUndefined();
            });
        });
    });

    describe("#getFilterMap", function() {
        describe("columns with typeCategory: OTHER", function() {
            beforeEach(function() {
                this.model.get("column").set({typeCategory: "OTHER"});
            });

            it("has an 'other' dataset filter map", function() {
                expect(this.model.getFilterMap()).toBeA(chorus.models.DatasetFilterMaps.Other);
            });
        });

        describe("columns with typeCategory: STRING, LONG_STRING", function() {
            beforeEach(function() {
                this.model.get("column").set({typeCategory: "STRING"});
            });

            it("has a 'string' dataset filter map", function() {
                expect(this.model.getFilterMap()).toBeA(chorus.models.DatasetFilterMaps.String);
            });
        });

        describe("columns with typeCategory: BOOLEAN", function() {
            beforeEach(function() {
                this.model.get("column").set({typeCategory: "BOOLEAN"});
            });

            it("has a 'boolean' dataset filter map", function() {
                expect(this.model.getFilterMap()).toBeA(chorus.models.DatasetFilterMaps.Boolean);
            });
        });

        describe("columns with typeCategory: WHOLE_NUMBER, REAL_NUMBER", function() {
            beforeEach(function() {
                this.model.get("column").set({typeCategory: "REAL_NUMBER"});
            });

            it("has a 'numeric' dataset filter map", function() {
                expect(this.model.getFilterMap()).toBeA(chorus.models.DatasetFilterMaps.Numeric);
            });
        });

        describe("columns with typeCategory: DATE", function() {
            beforeEach(function() {
                this.model.get("column").set({typeCategory: "DATE"});
            });

            it("has a 'date' dataset filter map", function() {
                expect(this.model.getFilterMap()).toBeA(chorus.models.DatasetFilterMaps.Date);
            });
        });

        describe("columns with typeCategory: DATETIME", function() {
            beforeEach(function() {
                this.model.get("column").set({typeCategory: "DATETIME"});
            });

            it("has a 'string' dataset filter map", function() {
                expect(this.model.getFilterMap()).toBeA(chorus.models.DatasetFilterMaps.Timestamp);
            });
        });

        describe("columns with typeCategory: TIME", function() {
            beforeEach(function() {
                this.model.get("column").set({typeCategory: "TIME"});
            });

            it("has a 'string' dataset filter map", function() {
                expect(this.model.getFilterMap()).toBeA(chorus.models.DatasetFilterMaps.Time);
            });
        });
    });

    describe("#sqlString", function() {
        beforeEach(function() {
            this.column.set({typeCategory: "STRING"});
            this.model.set({comparator: "not_equal", input: {value: "test"}})
            spyOn(this.model.getFilterMap().comparators.not_equal, "generate");
            this.model.sqlString();
        });

        it("calls the generate function of the correct filter type", function() {
            var qualifiedName = chorus.Mixins.dbHelpers.safePGName(this.column.get("parentName"), this.column.get("name"));
            expect(this.model.getFilterMap().comparators.not_equal.generate).toHaveBeenCalledWith(qualifiedName, "test");
        });

        it("doesn't crash when there is no input value", function() {
            this.model.unset("input");
            this.model.sqlString();
        });

    });
});