describe("chorus.models.KaggleFilter", function () {
    beforeEach(function () {
        this.column = new chorus.models.KaggleColumn({name:"my_column"});
        this.model = new chorus.models.KaggleFilter();
        this.model.set({column:this.column, comparator:"someComparator", input:{value:"one"}});
    });

    describe("#getFilterMap", function () {
        describe("columns with name 'rank'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"Rank"});
            });

            it("has an 'numeric' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.Numeric);
            });
        });

        describe("columns with name 'competitions'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"Number of Entered Competitions"});
            });

            it("has an 'numeric' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.Numeric);
            });
        });

        describe("columns with name 'competitions_types'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"Past Competition Types"});
            });

            it("has an 'competition type' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.CompetitionType);
            });
        });

        describe("columns with name 'Favorite Technique'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"Favorite Technique"});
            });

            it("has an 'string' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.String);
            });
        });

        describe("columns with name 'Favorite Software'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"Favorite Software"});
            });

            it("has an 'string' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.String);
            });
        });

        describe("columns with name 'location'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"Location"});
            });

            it("has an 'String' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.String);
            });
        });
    });

    describe("#filterParams", function() {
        it("pipe-delimits the filter info", function() {
            this.model.set({column: new chorus.models.KaggleColumn({name: "column_1"}),
                comparator: "greater",
                input: { value : "||123"}});
            expect(this.model.filterParams()).toEqual(encodeURIComponent("column_1") + "|" + encodeURIComponent("greater") + "|" + encodeURIComponent("||123"));
        });

        context("when the value is null", function() {
            it("is null", function() {
                this.model.set({column: new chorus.models.KaggleColumn({name: "column_1"}),
                    comparator: "greater",
                    input: null});
                expect(this.model.filterParams()).toBeFalsy();
            });

            it("is null", function() {
                this.model.set({column: new chorus.models.KaggleColumn({name: "column_1"}),
                    comparator: "greater",
                    input: {value: ''}});
                expect(this.model.filterParams()).toBeFalsy();
            });
        });
    });
});