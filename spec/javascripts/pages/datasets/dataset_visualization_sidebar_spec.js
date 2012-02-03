describe("chorus.views.DatasetVisualizationSidebar", function() {
    beforeEach(function() {
        this.column1 = fixtures.databaseColumn({typeCategory: "ANIMAL", name: "B Liger"})
        this.column2 = fixtures.databaseColumn({typeCategory: "REAL_NUMBER", name: "a Speed"})
        this.column3 = fixtures.databaseColumn({typeCategory: "WHOLE_NUMBER", name: "A Milk Duds"})
        this.column4 = fixtures.databaseColumn({typeCategory: "DATE", name: "the date"})
        this.column5 = fixtures.databaseColumn({typeCategory: "TIME", name: "the time"})
        this.column6 = fixtures.databaseColumn({typeCategory: "DATETIME", name: "the time & date"})

        this.columns = fixtures.databaseColumnSet([this.column1, this.column2, this.column3, this.column4, this.column5, this.column6]);
        this.view = new chorus.views.DatasetVisualizationSidebar({collection: this.columns})
    });

    it("should not modify the collection order", function() {
        expect(this.columns.pluck('name')).toEqual([ 'B Liger', 'a Speed', 'A Milk Duds', 'the date', 'the time', 'the time & date']);
    });

    describe("allColumnNames", function() {
        it("returns a sorted array of column names", function() {
            expect(this.view.allColumnNames()).toEqual(['A Milk Duds', 'a Speed', 'B Liger', 'the date', 'the time', 'the time & date']);
        })
    })

    describe("numericColumnNames", function() {
        it("returns a sorted array of numeric column names", function() {
            expect(this.view.numericColumnNames()).toEqual(['A Milk Duds', 'a Speed']);
        })
    })

    describe("datetimeColumnNames", function() {
        it("returns a sorted array of date/time column names", function() {
            expect(this.view.datetimeColumnNames()).toEqual(["the date", "the time", "the time & date"]);
        })
    })
})