describe("chorus.views.visualizations.Axes", function() {
    beforeEach(function() {
        var div = document.createElement("div");
        this.width = 300;
        this.height = 200;
        this.el = d3.select(div)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.$el = $(this.el[0][0]);
        $("#jasmine_content").append(this.$el);
    });

    beforeEach(function() {
        this.addMatchers({
            toBeVertical: function() {
                var y1 = topY(this.actual);
                var y2 = bottomY(this.actual);
                var x1 = leftX(this.actual);
                var x2 = rightX(this.actual);

                return y2 !== y1 && x1 === x2;
            },

            toBeHorizontal: function() {
                var y1 = topY(this.actual);
                var y2 = bottomY(this.actual);
                var x1 = leftX(this.actual);
                var x2 = rightX(this.actual);

                return y2 === y1 && x1 !== x2;
            },

            toBeWithinDeltaOf: function(value, margin) {
                if (!margin) margin = 0;
                var lowerBound = value - margin;
                var upperBound = value + margin;
                return (this.actual >= lowerBound) && (this.actual <= upperBound)
            },

            toBeLessThanOrEqualTo: function(upperBound) {
                return this.actual <= upperBound;
            },

            toBeGreaterThanOrEqualTo: function(upperBound) {
                return this.actual >= upperBound;
            }
        });
    });

    describe("XAxis", function() {
        beforeEach(function() {
            this.labelValues = ['one', 'two', 'three', 'four', 'five'];
            this.paddingX = 35;
            this.paddingY = 35;

            this.axis = new chorus.views.visualizations.XAxis({
                el: this.el,
                labels: this.labelValues,
                ticks: true,
                paddingX: this.paddingX,
                paddingY: this.paddingY
            });
            this.axis.render();

            this.axisLine = this.$el.find("line.axis");
            this.ticks    = this.$el.find("line.tick");
            this.labels   = this.$el.find(".label");
        });

        describe("the axis line", function() {
            it("is rendered to the chart", function() {
                expect(this.axisLine).toExist();
            });

            it("is horizontal", function() {
                expect(this.axisLine).toBeHorizontal();
            });

            it("goes across the bottom of the chart", function() {
                expect(leftX(this.axisLine)).toEqual(this.paddingX);
                expect(rightX(this.axisLine)).toEqual(this.width - this.paddingX);
            });
        });

        describe("the axis tick marks", function() {
            it("includes a vertical tick mark for each label", function() {
                expect(this.ticks.length).toBe(5);
                expect(this.ticks.eq(0)).toBeVertical();
                expect(this.ticks.eq(1)).toBeVertical();
                expect(this.ticks.eq(2)).toBeVertical();
                expect(this.ticks.eq(3)).toBeVertical();
                expect(this.ticks.eq(4)).toBeVertical();
            });

            it("draws the ticks extending down from the main axis line", function() {
                expect(topY(this.ticks[0])).toEqual(topY(this.axisLine));
                expect(topY(this.ticks[1])).toEqual(topY(this.axisLine));
                expect(topY(this.ticks[2])).toEqual(topY(this.axisLine));
                expect(topY(this.ticks[3])).toEqual(topY(this.axisLine));
                expect(topY(this.ticks[4])).toEqual(topY(this.axisLine));

                expect(bottomY(this.ticks[0])).toBeGreaterThan(topY(this.axisLine));
                expect(bottomY(this.ticks[1])).toBeGreaterThan(topY(this.axisLine));
                expect(bottomY(this.ticks[2])).toBeGreaterThan(topY(this.axisLine));
                expect(bottomY(this.ticks[3])).toBeGreaterThan(topY(this.axisLine));
                expect(bottomY(this.ticks[4])).toBeGreaterThan(topY(this.axisLine));
            });

            it("draws the ticks in order from left to right", function() {
                expect(leftX(this.ticks[0])).toBeLessThan(leftX(this.ticks[1]));
                expect(leftX(this.ticks[1])).toBeLessThan(leftX(this.ticks[2]));
                expect(leftX(this.ticks[2])).toBeLessThan(leftX(this.ticks[3]));
                expect(leftX(this.ticks[3])).toBeLessThan(leftX(this.ticks[4]));
            });

            it("spaces the ticks evenly across the width of the chart area", function() {
                var xs = this.ticks.map(function(i, tick) { return leftX(tick) });

                var distance = xs[1] - xs[0];
                var innerWidth = this.width - (2 * this.paddingX);

                expect(xs[2] - xs[1]).toEqual(distance);
                expect(xs[3] - xs[2]).toEqual(distance);
                expect(xs[4] - xs[3]).toEqual(distance);

                expect(distance).toBeBetween(innerWidth / 6, innerWidth / 5);
            });
        });

        describe("the tick labels", function() {
            it("renders each of the given labels", function() {
                expect(this.labels.length).toBe(5);

                expect(this.labels.eq(0).text()).toBe("one");
                expect(this.labels.eq(1).text()).toBe("two");
                expect(this.labels.eq(2).text()).toBe("three");
                expect(this.labels.eq(3).text()).toBe("four");
                expect(this.labels.eq(4).text()).toBe("five");
            });

            it("places the labels below the ticks", function() {
                expect(topY(this.labels[0])).toBeGreaterThan(bottomY(this.ticks[0]));
                expect(topY(this.labels[1])).toBeGreaterThan(bottomY(this.ticks[1]));
                expect(topY(this.labels[2])).toBeGreaterThan(bottomY(this.ticks[2]));
                expect(topY(this.labels[3])).toBeGreaterThan(bottomY(this.ticks[3]));
                expect(topY(this.labels[4])).toBeGreaterThan(bottomY(this.ticks[4]));
            });

            it("draws the labels in order from left to right", function() {
                expect(leftX(this.labels[0])).toBeLessThan(leftX(this.labels[1]));
                expect(leftX(this.labels[1])).toBeLessThan(leftX(this.labels[2]));
                expect(leftX(this.labels[2])).toBeLessThan(leftX(this.labels[3]));
                expect(leftX(this.labels[3])).toBeLessThan(leftX(this.labels[4]));
            });

            it("centers each label on its corresponding tick mark", function() {
                expect(leftX(this.ticks[0])).toBeWithinDeltaOf(centerX(this.labels[0]), 2);
                expect(leftX(this.ticks[1])).toBeWithinDeltaOf(centerX(this.labels[1]), 2);
                expect(leftX(this.ticks[2])).toBeWithinDeltaOf(centerX(this.labels[2]), 2);
                expect(leftX(this.ticks[3])).toBeWithinDeltaOf(centerX(this.labels[3]), 2);
                expect(leftX(this.ticks[4])).toBeWithinDeltaOf(centerX(this.labels[4]), 2);
            });
        });

        describe("the placement of the axis group", function() {
            beforeEach(function() {
                this.innerHeight = this.height - this.paddingY;
            });

            it("draws the axis line inside the padding", function() {
                expect(bottomY(this.axisLine)).toBeLessThanOrEqualTo(this.innerHeight);
            });

            it("draws the ticks inside the padding", function() {
                expect(bottomY(this.ticks[0])).toBeLessThanOrEqualTo(this.innerHeight);
            });

            it("draws the labels inside the padding", function() {
                var innerHeightPlusBoundingBoxError = this.innerHeight + 5;
                expect(bottomY(this.labels[0])).toBeLessThanOrEqualTo(innerHeightPlusBoundingBoxError);
            });
        });
    });

    describe("YAxis", function() {
        beforeEach(function() {
            this.labelValues = ['one', 'two', 'three', 'four', 'five'];
            this.paddingX = 35;
            this.paddingY = 35;

            this.axis = new chorus.views.visualizations.YAxis({
                el: this.el,
                labels: this.labelValues,
                ticks: true,
                paddingX: this.paddingX,
                paddingY: this.paddingY
            });
            this.axis.render();

            this.axisLine = this.$el.find("line.axis");
            this.ticks    = this.$el.find("line.tick");
            this.labels   = this.$el.find(".label");
        });

        it("does not interfere with other elements in the svg container", function() {
            this.$el.empty();

            this.otherTick = $("<line class='tick'></line")
                .attr("x1", 101)
                .attr("x2", 102)
                .attr("y1", 103)
                .attr("y2", 104);
            this.otherLabel = $("<text class='label'></text")
                .attr("x", 201)
                .attr("y", 203)
                .text("other labels need to stay");
            this.otherAxisLine = $("<line class='axis'></line")
                .attr("x1", 301)
                .attr("x2", 302)
                .attr("y1", 303)
                .attr("y2", 304);

            this.$el.append(this.otherTick);
            this.$el.append(this.otherLabel);
            this.$el.append(this.otherAxisLine);

            this.axis.render();

            expect(this.otherTick).toHaveAttr("x1", '101');
            expect(this.otherLabel).toHaveAttr("x", '201');
            expect(this.otherAxisLine).toHaveAttr("x1", '301');
        });

        describe("the axis line", function() {
            it("is rendered to the chart", function() {
                expect(this.axisLine).toExist();
            });

            it("is vertical", function() {
                expect(this.axisLine).toBeVertical();
            });

            it("goes across the left side of the chart", function() {
                expect(topY(this.axisLine)).toEqual(this.paddingY);
                expect(bottomY(this.axisLine)).toEqual(this.height - this.paddingY);
            });
        });

        describe("the axis tick marks", function() {
            it("includes a horizontal tick mark for each label", function() {
                expect(this.ticks.length).toBe(5);
                expect(this.ticks.eq(0)).toBeHorizontal();
                expect(this.ticks.eq(1)).toBeHorizontal();
                expect(this.ticks.eq(2)).toBeHorizontal();
                expect(this.ticks.eq(3)).toBeHorizontal();
                expect(this.ticks.eq(4)).toBeHorizontal();
            });

            it("draws the ticks extending left from the main axis line", function() {
                expect(rightX(this.ticks[0])).toEqual(leftX(this.axisLine));
                expect(rightX(this.ticks[1])).toEqual(leftX(this.axisLine));
                expect(rightX(this.ticks[2])).toEqual(leftX(this.axisLine));
                expect(rightX(this.ticks[3])).toEqual(leftX(this.axisLine));
                expect(rightX(this.ticks[4])).toEqual(leftX(this.axisLine));

                expect(leftX(this.ticks[0])).toBeLessThan(leftX(this.axisLine));
                expect(leftX(this.ticks[1])).toBeLessThan(leftX(this.axisLine));
                expect(leftX(this.ticks[2])).toBeLessThan(leftX(this.axisLine));
                expect(leftX(this.ticks[3])).toBeLessThan(leftX(this.axisLine));
                expect(leftX(this.ticks[4])).toBeLessThan(leftX(this.axisLine));
            });

            it("draws the ticks in order from bottom to top", function() {
                expect(topY(this.ticks[0])).toBeGreaterThan(topY(this.ticks[1]));
                expect(topY(this.ticks[1])).toBeGreaterThan(topY(this.ticks[2]));
                expect(topY(this.ticks[2])).toBeGreaterThan(topY(this.ticks[3]));
                expect(topY(this.ticks[3])).toBeGreaterThan(topY(this.ticks[4]));
            });

            it("spaces the ticks evenly along the height of the chart area", function() {
                var ys = this.ticks.map(function(i, tick) { return topY(tick) });

                var distance = Math.abs(ys[1] - ys[0]);
                var innerHeight = this.height - (2 * this.paddingY);

                expect(Math.abs(ys[2] - ys[1])).toEqual(distance);
                expect(Math.abs(ys[3] - ys[2])).toEqual(distance);
                expect(Math.abs(ys[4] - ys[3])).toEqual(distance);

                expect(distance).toBeBetween(innerHeight / 6, innerHeight / 5);
            });
        });

        describe("the tick labels", function() {
            it("renders each of the given labels", function() {
                expect(this.labels.length).toBe(5);

                expect(this.labels.eq(0).text()).toBe("one");
                expect(this.labels.eq(1).text()).toBe("two");
                expect(this.labels.eq(2).text()).toBe("three");
                expect(this.labels.eq(3).text()).toBe("four");
                expect(this.labels.eq(4).text()).toBe("five");
            });

            it("places the labels to the left of the ticks", function() {
                expect(rightX(this.labels[0])).toBeLessThan(leftX(this.ticks[0]));
                expect(rightX(this.labels[1])).toBeLessThan(leftX(this.ticks[1]));
                expect(rightX(this.labels[2])).toBeLessThan(leftX(this.ticks[2]));
                expect(rightX(this.labels[3])).toBeLessThan(leftX(this.ticks[3]));
                expect(rightX(this.labels[4])).toBeLessThan(leftX(this.ticks[4]));
            });

            it("draws the labels in order from bottom to top", function() {
                expect(topY(this.labels[0])).toBeGreaterThan(topY(this.labels[1]));
                expect(topY(this.labels[1])).toBeGreaterThan(topY(this.labels[2]));
                expect(topY(this.labels[2])).toBeGreaterThan(topY(this.labels[3]));
                expect(topY(this.labels[3])).toBeGreaterThan(topY(this.labels[4]));
            });

            it("centers each label on its corresponding tick mark", function() {
                expect(centerY(this.labels[0])).toBeWithinDeltaOf(topY(this.ticks[0]), 2);
                expect(centerY(this.labels[1])).toBeWithinDeltaOf(topY(this.ticks[1]), 2);
                expect(centerY(this.labels[2])).toBeWithinDeltaOf(topY(this.ticks[2]), 2);
                expect(centerY(this.labels[3])).toBeWithinDeltaOf(topY(this.ticks[3]), 2);
                expect(centerY(this.labels[4])).toBeWithinDeltaOf(topY(this.ticks[4]), 2);
            });
        });

        describe("the placement of the axis group", function() {
            beforeEach(function() {
                this.innerHeight = this.height - this.paddingY;
            });

            it("draws the axis line inside the padding", function() {
                expect(leftX(this.axisLine)).toBeGreaterThanOrEqualTo(this.paddingX);
            });

            it("draws the ticks inside the padding", function() {
                expect(leftX(this.ticks[0])).toBeGreaterThanOrEqualTo(this.paddingX);
            });

            it("draws the labels inside the padding", function() {
                expect(leftX(this.labels[0])).toBeGreaterThanOrEqualTo(this.paddingX);
            });
        });
    });

    describe("Axes", function() {
        beforeEach(function() {
            this.xLabelValues = ['one', 'two', 'three', 'four', 'five'];
            this.yLabelValues = ['january', 'february', 'march', 'april', 'may'];
            this.paddingX = 35;
            this.paddingY = 35;

            this.axes = new chorus.views.visualizations.Axes({
                el: this.el,
                ticks: true,
                xLabels: this.xLabelValues,
                yLabels: this.xLabelValues,
                paddingX: this.paddingX,
                paddingY: this.paddingY
            });

            this.axes.render();

            this.xAxisLine = this.$el.find("g.xaxis line.axis");
            this.yAxisLine = this.$el.find("g.yaxis line.axis");
            this.xTicks    = this.$el.find("g.xaxis line.tick");
            this.xTicks    = this.$el.find("g.yaxis line.tick");
            this.xLabels   = this.$el.find("g.xaxis text.label");
            this.yLabels   = this.$el.find("g.yaxis text.label");
        });

        describe("axis positioning", function() {
            beforeEach(function() {
            });
        });
    });

    function topY(el) {
        return _.min(coordsY(el));
    }

    function bottomY(el) {
        return _.max(coordsY(el));
    }

    function rightX(el) {
        return _.max(coordsX(el));
    }

    function leftX(el) {
        return _.min(coordsX(el));
    }

    function centerY(el) {
        var ys = coordsY(el);
        return (ys[0] + ys[1]) / 2;
    }

    function centerX(el) {
        var xs = coordsX(el);
        return (xs[0] + xs[1]) / 2;
    }

    function coordsX(el) {
        var box = $(el)[0].getBBox();
        return [box.x, box.x + box.width];
    }

    function coordsY(el) {
        var box = $(el)[0].getBBox();
        return [box.y, box.y + box.height];
    }
});
