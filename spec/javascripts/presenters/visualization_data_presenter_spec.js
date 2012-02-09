describe("chorus.presenters.visualizations", function() {
    describe("Timeseries", function() {
        beforeEach(function() {
            this.model = fixtures.timeseriesTaskWithResult({
                columns: [
                    { name: "id" },
                    { name: "value" },
                    { name: "animal" }
                ],
                rows: [
                    { time: '1', value: 321 },
                    { time: '6', value: 1024 },
                    { time: '5', value: 573 }
                ]
            });

            this.presenter = new chorus.presenters.visualizations.Timeseries(this.model);

            this.data = this.presenter.present();
        });

        it("presents an array of pairs of values from the given time and value columns", function() {
            expect(this.data.length).toBe(3);
            expect(this.data[0]).toEqual({ time: "1", value: 321 });
            expect(this.data[1]).toEqual({ time: "6", value: 1024 });
            expect(this.data[2]).toEqual({ time: "5", value: 573 });
        });

    });

    describe("Frequency", function() {
        beforeEach(function() {
            this.model = fixtures.frequencyTaskWithResult({
                rows: [
                    { bucket: 'aardvark', count: 1024 },
                    { bucket: 'beluga', count: 573 },
                    { bucket: 'chupacabra', count: 321 }
                ]
            });

            this.presenter = new chorus.presenters.visualizations.Frequency(this.model);
            this.data = this.presenter.present();
        });

        it("returns a reversed array of bucket, count hashes", function() {
            var reversed_rows = [
                { bucket: 'chupacabra', count: 321 },
                { bucket: 'beluga', count: 573 },
                { bucket: 'aardvark', count: 1024 }
            ];
            expect(this.data).toEqual(reversed_rows);
        });
    });

    describe("Boxplot", function() {
        beforeEach(function() {
            this.model = fixtures.boxplotTaskWithResult({
                rows: [
                    { bucket: 'beluga',     min: 100, firstQuartile: 100, median: 250, thirdQuartile: 300, max: 400, percentage: "33.3%" },
                    { bucket: 'aardvark',   min: 1,   firstQuartile: 1,   median: 2.5, thirdQuartile: 3,   max: 4,   percentage: "25%" },
                    { bucket: 'chupacabra', min: 10,  firstQuartile: 10,  median: 25,  thirdQuartile: 30,  max: 40,  percentage: "81.5%" }
                ]
            });

            this.presenter = new chorus.presenters.visualizations.Boxplot(this.model);
            this.data = this.presenter.present();
        });

        it("presents arrays of {bucket, min, firstQuartile, median, thirdQuartile, max, percentage}, in order of descending percentage", function() {
            expect(this.data.length).toBe(3);

            expect(this.data[0]).toEqual({ bucket: 'chupacabra', min: 10,  firstQuartile: 10,  median: 25,  thirdQuartile: 30,  max: 40,  percentage: "81.5%" });
            expect(this.data[1]).toEqual({ bucket: 'beluga',     min: 100, firstQuartile: 100, median: 250, thirdQuartile: 300, max: 400, percentage: "33.3%" });
            expect(this.data[2]).toEqual({ bucket: 'aardvark',   min: 1,   firstQuartile: 1,   median: 2.5, thirdQuartile: 3,   max: 4,   percentage: "25%" });
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
        it("returns bin and frequency as bin and frequency", function() {
            var x = _.pluck(this.data, "bin");
            var y = _.pluck(this.data, "frequency");
            expect(y).toEqual([5,8,0,1,2000]);
            expect(x).toEqual(["0-9","10-19","20-29","30-39","40-49"]);
        })
    })

    describe("Heatmap", function() {
        beforeEach(function() {
            this.model = fixtures.heatmapTaskWithResult({
                rows: [
                    { yLabel: "[30-71.8]",     xLabel: "[0-1.8]",   value: 39541, y: 1, x: 1 },
                    { yLabel: "[71.8-113.6]",  xLabel: "[0-1.8]",   value: 39873, y: 2, x: 1 },
                    { yLabel: "[113.6-155.4]", xLabel: "[0-1.8]",   value: 39993, y: 3, x: 1 },
                    { yLabel: "[155.4-197.2]", xLabel: "[0-1.8]",   value: 39596, y: 4, x: 1 },
                    { yLabel: "[30-71.8]",     xLabel: "[1.8-3.6]", value: 39818, y: 1, x: 2 },
                    { yLabel: "[71.8-113.6]",  xLabel: "[1.8-3.6]", value: 39838, y: 2, x: 2 },
                    { yLabel: "[113.6-155.4]", xLabel: "[1.8-3.6]", value: 39911, y: 3, x: 2 },
                    { yLabel: "[155.4-197.2]", xLabel: "[1.8-3.6]", value: 40757, y: 4, x: 2 },
                    { yLabel: "[30-71.8]",     xLabel: "[3.6-5.4]", value: 39631, y: 1, x: 3 },
                    { yLabel: "[71.8-113.6]",  xLabel: "[3.6-5.4]", value: 40174, y: 2, x: 3 },
                ]
            });

            this.presenter = new chorus.presenters.visualizations.Heatmap(this.model);
            this.data = this.presenter.present();
        });

        it("returns the rows", function() {
            expect(this.data[0]).toEqual({ yLabel: "[30-71.8]",     xLabel: "[0-1.8]",   value: 39541, y: 1, x: 1 });
            expect(this.data[1]).toEqual({ yLabel: "[71.8-113.6]",  xLabel: "[0-1.8]",   value: 39873, y: 2, x: 1 });
        });

        it("sets the min and max x and y values", function() {
            expect(this.data.minX).toBe(0);
            expect(this.data.minY).toBe(30);
            expect(this.data.maxX).toBe(5.4);
            expect(this.data.maxY).toBe(197.2);
        });

        it("sets the minValue and maxValue", function() {
            expect(this.data.minValue).toBe(39541);
            expect(this.data.maxValue).toBe(40757);
        });
    });
});
