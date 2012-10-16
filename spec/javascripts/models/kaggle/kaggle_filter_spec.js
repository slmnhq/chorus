describe("chorus.models.KaggleFilter", function () {
    beforeEach(function () {
        this.column = new chorus.models.KaggleColumn({name:"my_column"});
        this.model = new chorus.models.KaggleFilter();
        this.model.set({column:this.column, comparator:"someComparator", input:{value:"one"}});
    });

    describe("#getFilterMap", function () {
        describe("columns with name 'rank'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"rank"});
            });

            it("has an 'numeric' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.Numeric);
            });
        });

        describe("columns with name 'competitions'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"competitions"});
            });

            it("has an 'numeric' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.Numeric);
            });
        });

        describe("columns with name 'competitions_types'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"competition_types"});
            });

            it("has an 'competition type' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.CompetitionType);
            });
        });

        describe("columns with name 'fav_techniques'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"fav_techniques"});
            });

            it("has an 'string' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.String);
            });
        });

        describe("columns with name 'fav_software'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"fav_software"});
            });

            it("has an 'string' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.String);
            });
        });

        describe("columns with name 'location'", function () {
            beforeEach(function () {
                this.model.get("column").set({name:"location"});
            });

            it("has an 'String' kaggle filter map", function () {
                expect(this.model.getFilterMap()).toBeA(chorus.models.KaggleFilterMaps.String);
            });
        });
    });
});