describe("chorus.views.visualizations.NewAxis", function() {
    beforeEach(function() {
        var div = document.createElement("div");
        this.width = 300;
        this.height = 200;
        this.el = d3.select(div)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.$el = $(this.el[0][0]);
        this.xLabels = ['one', 'two', 'three', 'four', 'five'];
        this.yLabels = [1, 2, 3, 4];

        $("#jasmine_content").append(this.$el);
    });

    describe("with an orientation of 'south'", function() {
        beforeEach(function() {
            this.axis = new chorus.views.visualizations.NewAxis({
                el: this.el,
                labels: this.xLabels,
                orientation: 'south',
                ticks: true
            });
            this.axis.render();
        });

        describe("the main axis line", function() {
            beforeEach(function() {
                this.line = this.$el.find("line");
            });

            it("is rendered to the chart", function() {
                expect(this.line).toExist();
            });

            it("is horizontal", function() {
                expect(this.line.attr("y1")).toEqual(this.line.attr("y2"));
            });

            it("goes across the bottom of the chart", function() {
                expect(this.line.attr("x1")).toBeLessThan(20);
                expect(this.line.attr("x2")).toBeGreaterThan(280);

                expect(this.line.attr("y1")).toBeLessThan(20);
            });
        });

        describe("the axis labeling", function() {
            beforeEach(function() {
                this.labels = this.$el.find(".label");
                this.ticks = this.$el.find(".tick");
            });

            it("includes a label for each of the given x labels", function() {
                expect(this.labels.length).toBe(5);
                var texts = pluckText(this.labels);

                expect(texts[0]).toBe("one");
                expect(texts[1]).toBe("two");
                expect(texts[2]).toBe("three");
                expect(texts[3]).toBe("four");
                expect(texts[4]).toBe("five");
            });

            it("draws the labels in order from left to right", function() {
                var xs = pluckAttr(this.labels, 'x');

                expect(xs[0]).toBeLessThan(xs[1]);
                expect(xs[1]).toBeLessThan(xs[2]);
                expect(xs[2]).toBeLessThan(xs[3]);
                expect(xs[3]).toBeLessThan(xs[4]);
            });

            it("spaces the labels evenly across the width of the chart area", function() {
                var xs = pluckAttr(this.labels, 'x');

                expect(xs[1] - xs[0]).toBeBetween(this.width / 6, this.width / 5);
                expect(xs[2] - xs[1]).toBeBetween(this.width / 6, this.width / 5);
                expect(xs[3] - xs[2]).toBeBetween(this.width / 6, this.width / 5);
                expect(xs[4] - xs[3]).toBeBetween(this.width / 6, this.width / 5);
            });

            it("includes a vertical tick mark for each label", function() {
                expect(this.ticks.length).toBe(5);

                var x1s = pluckAttr(this.ticks, 'x1');
                var x2s = pluckAttr(this.ticks, 'x2');
                var y1s = pluckAttr(this.ticks, 'y1');
                var y2s = pluckAttr(this.ticks, 'y2');

                expect(x1s).toEqual(x2s);
                expect(y1s).not.toEqual(y2s);
            });

            it("centers each tick mark with its corresponding label", function() {
                var tickXs   = pluckAttr(this.ticks, 'x1');
                var labelX1s = pluckAttr(this.labels, 'x');
                var labelX2s = this.labels.map(function(i, label) {
                    return parseFloat($(label).attr("x")) + parseFloat($(label).width());
                });

                expect(tickXs[0]).toBeGreaterThan(labelX1s[0]);
                expect(tickXs[0]).toBeLessThan(labelX2s[0]);
                expect(tickXs[1]).toBeGreaterThan(labelX1s[1]);
                expect(tickXs[1]).toBeLessThan(labelX2s[1]);
                expect(tickXs[2]).toBeGreaterThan(labelX1s[2]);
                expect(tickXs[2]).toBeLessThan(labelX2s[2]);
                expect(tickXs[3]).toBeGreaterThan(labelX1s[3]);
                expect(tickXs[3]).toBeLessThan(labelX2s[3]);
                expect(tickXs[4]).toBeGreaterThan(labelX1s[4]);
                expect(tickXs[4]).toBeLessThan(labelX2s[4]);
            });
        });
    });

    function pluckText(jqArray) {
        return jqArray.map(function(i, el) {
            return $(el).text();
        });
    }

    function pluckAttr(jqArray, attrName) {
        return jqArray.map(function(i, el) {
            var attr = $(el).attr(attrName);
            return parseFloat(attr);
        });
    }
});
