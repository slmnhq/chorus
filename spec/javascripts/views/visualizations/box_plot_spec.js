describe("chorus.views.visualizations.BoxPlot", function() {
    beforeEach(function() {
        this.task = new chorus.models.Task({
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
                    { id: 11, value: 30, animal: "chupacabra" }
                ]
            }
        });

        this.view = new chorus.views.visualizations.BoxPlot({
            model: this.task,
            x: "animal",
            y: "value"
        });
    });
    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })
        it("has one box for each animal type", function() {
            expect(this.view.$("g.box").length).toBe(3);
        })

        it("renders no xtick lines by default", function() {
            expect(this.view.$("line.xtick").length).toBe(0);
        });

        it("renders ytick lines by default", function() {
            expect(this.view.$("line.ytick").length).toBeGreaterThan(1);
        });
    })
});

