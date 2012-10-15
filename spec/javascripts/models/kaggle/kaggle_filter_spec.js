describe("chorus.models.KaggleFilter", function () {
    beforeEach(function () {
        this.model = new chorus.models.KaggleFilter();
    });

    describe("#setColumn", function () {
        it("changes the column correctly", function () {
            var column = new chorus.models.KaggleColumn({name: 'rank'})
            this.model.setColumn(column);
            expect(this.model.get("column").attributes).toEqual(column.attributes);
        });
    });
});