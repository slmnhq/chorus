describe("chorus.views.visualizations.BoxPlot", function() {
    beforeEach(function() {
        this.task = new chorus.models.SqlExecutionTask({
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

        it("draws the median line", function() {
            var $boxes = this.view.$("g.box");
            $boxes.each(function(_idx, box){
                var $box = $(box);
                var $rect = $box.find("rect");
                var width = parseFloat($rect.attr("width"));
                var height = parseFloat($rect.attr("height"));
                var x = parseFloat($rect.attr("x"));
                var y = parseFloat($rect.attr("y"));

                var $line = $box.find("line.median");
                expect($line.attr("x1")).toBeCloseTo(x);
                expect($line.attr("x2")).toBeCloseTo(x + width);

                expect($line.attr("y2")).toBe($line.attr("y1"));
                expect($line.attr("y2")).toBeGreaterThan(y);
                expect($line.attr("y2")).toBeLessThan(y + height);
            });
        });

        describe("whiskers", function() {
            it("aligns horizontally with the boxes", function() {
                var $boxes = this.view.$("g.box");
                $boxes.each(function(_idx, box){
                    var $box = $(box);
                    var $rect = $box.find("rect");
                    var width = parseFloat($rect.attr("width"));
                    var x = parseFloat($rect.attr("x"));

                    var $line = $box.find("line.whisker.vertical");
                    expect($line.attr("x2")).toBe($line.attr("x1"));
                    expect($line.attr("x2")).toBeCloseTo(x+0.5*width);
                });
            })

            it("has horizontal tips", function() {
                var $boxes = this.view.$("g.box");
                $boxes.each(function(_idx, box){
                    var $box = $(box);
                    var $rect = $box.find("rect");
                    var width = parseFloat($rect.attr("width"));
                    var x = parseFloat($rect.attr("x"));

                    var $line_top = $box.find("line.whisker.top");
                    var $line_bottom = $box.find("line.whisker.bottom");
                    expect($line_top.attr("y2")).toBe($line_top.attr("y1"));
                    expect($line_bottom.attr("y2")).toBe($line_bottom.attr("y1"));
                });
            })

            it("is thinner than the boxes", function() {
                var $boxes = this.view.$("g.box");
                $boxes.each(function(_idx, box){
                    var $box = $(box);
                    var $rect = $box.find("rect");
                    var width = parseFloat($rect.attr("width"));
                    var x = parseFloat($rect.attr("x"));

                    var $line = $box.find("line.whisker.top, line.whisker.bottom");
                    expect($line.attr("x1")).toBeLessThan($line.attr("x2"));
                    expect($line.attr("x1")).toBeGreaterThan(x);
                    expect($line.attr("x2")).toBeLessThan(x+width);
                });
            })

        })
    })
});

