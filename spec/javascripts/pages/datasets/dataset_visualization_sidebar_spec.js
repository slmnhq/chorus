describe("chorus.views.DatasetVisualizationSidebar", function() {
    beforeEach(function() {
        this.column1 = fixtures.databaseColumn({typeCategory: "ANIMAL", name: "B Liger"})
        this.column2 = fixtures.databaseColumn({typeCategory: "REAL_NUMBER", name: "a Speed"})
        this.column3 = fixtures.databaseColumn({typeCategory: "WHOLE_NUMBER", name: "A Milk Duds"})

        this.columns = fixtures.databaseColumnSet([this.column1, this.column2, this.column3]);
        this.view = new chorus.views.DatasetVisualizationSidebar({collection: this.columns})
    });

    it("should not modify the collection order", function() {
        expect(this.columns.pluck('name')).toEqual(['B Liger', 'a Speed', 'A Milk Duds']);
    });

    describe("allColumns", function() {
        it("returns an sorted array of column names", function() {
            expect(this.view.allColumns()).toEqual(['A Milk Duds', 'a Speed', 'B Liger']);
        })
    })

    describe("numericColumns", function() {
        it("returns an sorted array of numeric column names", function() {
            expect(this.view.numericColumns()).toEqual(['A Milk Duds', 'a Speed']);
        })
    })
})