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
            this.model = new chorus.models.SqlExecutionTask({
                result: {
                    columns: [{ name: "id" }, { name: "value" }, { name: "animal" }],
                    rows: [
                        { id: 1, value: 1, animal:  "aardvark" },
                        { id: 2, value: 2, animal: "aardvark" },
                        { id: 3, value: 3, animal: "aardvark" },
                        { id: 4, value: 4, animal: "aardvark" },
                        { id: 5, value: 100, animal: "beluga" },
                        { id: 6, value: 200, animal: "beluga" },
                        { id: 7, value: 300, animal: "beluga" },
                        { id: 8, value: 400, animal: "beluga" },
                        { id: 9, value: 10, animal: "chupacabra" },
                        { id: 10, value: 20, animal: "chupacabra" },
                        { id: 11, value: 30, animal: "chupacabra" },
                        { id: 12, value: 40, animal: "chupacabra" }
                    ]
                }
            });

            this.presenter = new chorus.presenters.visualizations.Frequency(this.model, {
                column: "animal"
            });

            this.data = this.presenter.present();
        });

        it("returns a hash of field-value to number of occurences", function() {
            expect(this.data.frequencies).toEqual({
                'chupacabra' : 4,
                'aardvark' : 4,
                'beluga' : 4
            });
        });
    });

    describe("Boxplot", function() {
        beforeEach(function() {
            this.model = new chorus.models.SqlExecutionTask({
                result: {
                    columns: [{ name: "id" }, { name: "value" }, { name: "animal" }],
                    rows: [
                        { id: 1, value: 1, animal:  "aardvark" },
                        { id: 2, value: 2, animal: "aardvark" },
                        { id: 3, value: 3, animal: "aardvark" },
                        { id: 4, value: 4, animal: "aardvark" },
                        { id: 5, value: 100, animal: "beluga" },
                        { id: 6, value: 200, animal: "beluga" },
                        { id: 7, value: 300, animal: "beluga" },
                        { id: 8, value: 400, animal: "beluga" },
                        { id: 9, value: 10, animal: "chupacabra" },
                        { id: 10, value: 20, animal: "chupacabra" },
                        { id: 11, value: 30, animal: "chupacabra" },
                        { id: 12, value: 40, animal: "chupacabra" }
                    ]
                }
            });

            this.presenter = new chorus.presenters.visualizations.Boxplot(this.model, {
                x: "animal",
                y: "value"
            });

            this.data = this.presenter.present();
        });

        it("presents arrays of {key, min, q1, mean, q3, max}", function() {
            expect(this.data.length).toBe(3);

            expect(this.data[0]).toEqual({name: 'aardvark', min: 1, q1: 1, median: 2.5, q3: 3, max: 4});
            expect(this.data[1]).toEqual({name: 'beluga', min: 100, q1: 100, median: 250, q3: 300, max: 400});
            expect(this.data[2]).toEqual({name: 'chupacabra', min: 10, q1: 10, median: 25, q3: 30, max: 40});
        });

        it("sets minY and maxY", function() {
            expect(this.data.minY).toBe(1);
            expect(this.data.maxY).toBe(400);
        })
    });
});
