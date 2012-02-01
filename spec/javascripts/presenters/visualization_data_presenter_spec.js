describe("chorus.presenters.visualizations", function() {
    describe("XY", function() {
        beforeEach(function() {
            this.model = new chorus.models.SqlExecutionTask({
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

            this.presenter = new chorus.presenters.visualizations.XY(this.model, {
                x: "id",
                y: "value"
            });

            this.data = this.presenter.present();
        });

        it("presents an array of pairs of values from the given x and y columns", function() {
            expect(this.data.length).toBe(5);

            expect(this.data[0]).toEqual({ x: 1, y: 5 });
            expect(this.data[1]).toEqual({ x: 2, y: 10 });
            expect(this.data[2]).toEqual({ x: 3, y: 15 });
            expect(this.data[3]).toEqual({ x: 4, y: 20 });
            expect(this.data[4]).toEqual({ x: 5, y: 25 });
        });

        it("has minimum and maximum values for the x and y columns", function() {
            expect(this.data.minX).toBe(1);
            expect(this.data.minY).toBe(5);

            expect(this.data.maxX).toBe(5);
            expect(this.data.maxY).toBe(25);
        });
    });

    describe("Frequency", function() {
        beforeEach(function() {
            this.model = fixtures.frequencyTaskWithResult({
                result: {
                    rows: [
                        { bucket: 'chupacabra', count: 321 },
                        { bucket: 'aardvark', count: 1024 },
                        { bucket: 'beluga', count: 573 }
                    ]
                }
            });

            this.presenter = new chorus.presenters.visualizations.Frequency(this.model);
            this.data = this.presenter.present();
        });

        it("returns a hash of field-value to number of occurences", function() {
            expect(this.data.frequencies).toEqual({
                chupacabra : 321,
                aardvark : 1024,
                beluga : 573
            });
        });
    });

    describe("Boxplot", function() {
        beforeEach(function() {
            this.model = fixtures.boxplotTaskWithResult({
                result: {
                    rows: [
                        { bucket: 'aardvark',   min: 1,   firstQuartile: 1,   median: 2.5, thirdQuartile: 3,   max: 4,   percentage: "25%" },
                        { bucket: 'beluga',     min: 100, firstQuartile: 100, median: 250, thirdQuartile: 300, max: 400, percentage: "33.3%" },
                        { bucket: 'chupacabra', min: 10,  firstQuartile: 10,  median: 25,  thirdQuartile: 30,  max: 40,  percentage: "81.5%" }
                    ],
                }
            });

            this.presenter = new chorus.presenters.visualizations.Boxplot(this.model);
            this.data = this.presenter.present();
        });

        it("presents arrays of {bucket, min, firstQuartile, median, thirdQuartile, max}", function() {
            expect(this.data.length).toBe(3);

            expect(this.data[0]).toEqual({ bucket: 'aardvark',   min: 1,   firstQuartile: 1,   median: 2.5, thirdQuartile: 3,   max: 4 });
            expect(this.data[1]).toEqual({ bucket: 'beluga',     min: 100, firstQuartile: 100, median: 250, thirdQuartile: 300, max: 400 });
            expect(this.data[2]).toEqual({ bucket: 'chupacabra', min: 10,  firstQuartile: 10,  median: 25,  thirdQuartile: 30,  max: 40 });
        });

        it("sets minY and maxY", function() {
            expect(this.data.minY).toBe(1);
            expect(this.data.maxY).toBe(400);
        });
    });

    describe("histogram", function() {
        beforeEach(function() {
            this.model = new chorus.models.HistogramTask({
                columns: [
                    {name : "bin", typeCategory: "STRING"},
                    {name : "frequency", typeCategory: "WHOLE_NUMBER"}
                ],

                rows: [
                    { bin: "0-9", frequency: 5 },
                    { bin: "10-19", frequency: 8 },
                    { bin: "20-29", frequency: 0 },
                    { bin: "30-39", frequency: 1 },
                    { bin: "40-49", frequency: 2000 }
                ]
            });
            this.presenter = new chorus.presenters.visualizations.Histogram(this.model);

            this.data = this.presenter.present();
        });
        it("returns bin and frequency as x and y", function() {
            var x = _.pluck(this.data, "x");
            var y = _.pluck(this.data, "y");
            expect(y).toEqual([5,8,0,1,2000]);
            expect(x).toEqual(["0-9","10-19","20-29","30-39","40-49"]);
        })
    })
});
