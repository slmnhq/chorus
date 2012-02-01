describe("chorus.views.visualizations.BoxPlot", function() {
    beforeEach(function() {
        this.task = fixtures.boxplotTaskWithResult({
            result: {
                rows: [
                    { bucket: 'aardvark',   min: 1,   firstQuartile: 1,   median: 2.5, thirdQuartile: 3,   max: 4,   percentage: "25%" },
                    { bucket: 'beluga',     min: 100, firstQuartile: 100, median: 250, thirdQuartile: 300, max: 400, percentage: "33.3%" },
                    { bucket: 'chupacabra', min: 10,  firstQuartile: 10,  median: 25,  thirdQuartile: 30,  max: 40,  percentage: "81.5%" }
                ],
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
        });

        it("has one box for each bucket", function() {
            expect(this.view.$("g.box").length).toBe(3);
        });

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

