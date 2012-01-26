describe("chorus.presenters.visualizations", function() {
    beforeEach(function() {
        this.model = new chorus.models.Task({
            result: {
                columns: [{ name: "id" }, { name: "value" }, { name: "animal" }],
                rows: [
                    { id: 1, value: 5, animal: "aardvark" },
                    { id: 2, value: 10, animal: "aardvark" },
                    { id: 3, value: 15, animal: "aardvark" },
                    { id: 4, value: 20, animal: "aardvark" },
                    { id: 5, value: 25, animal: "aardvark" }
                ]
            }
        });
    });

    describe("XY", function() {
        beforeEach(function() {
            this.presenter = new chorus.presenters.visualizations.XY(this.model, {
                x: "id",
                y: "value"
            });

            this.data = this.presenter.present();
        });

        it("presents an array of pairs of values from the given x and y columns", function() {
            expect(this.data.length).toBe(5);

            expect(this.data[0]).toEqual([1, 5]);
            expect(this.data[1]).toEqual([2, 10]);
            expect(this.data[2]).toEqual([3, 15]);
            expect(this.data[3]).toEqual([4, 20]);
            expect(this.data[4]).toEqual([5, 25]);
        });
    });
});
