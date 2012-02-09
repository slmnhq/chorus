describe("chorus.views.visualizations.FrequencyView", function() {
    var leftX = chorus.svgHelpers.leftX,
        rightX = chorus.svgHelpers.rightX,
        width = chorus.svgHelpers.width,
        height = chorus.svgHelpers.height,
        centerX = chorus.svgHelpers.centerX,
        topY = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY,
        centerY = chorus.svgHelpers.centerY;

    beforeEach(function() {
        this.task = fixtures.frequencyTaskWithResult({
            rows: [
                { bucket: 'aardvark',   count: 10000},
                { bucket: 'beluga',     count: 4000},
                { bucket: 'chupacabra', count: 500}
            ],
            "chart[yAxis]": "animals"
        });

        this.view = new chorus.views.visualizations.Frequency({ model: this.task });
        this.addMatchers(chorus.svgHelpers.matchers);
    });

    describe("#render", function() {
        beforeEach(function() {
            $("#jasmine_content").append(this.view.el);
            this.view.render();
            this.boxes = this.view.$("rect");
        });

        it("has the correct axis labels", function() {
            expect(this.view.$('.xaxis .axis_label').text()).toBe("count")
            expect(this.view.$('.yaxis .axis_label').text()).toBe("animals")
        });

        describe("the frequency rectangles", function() {
            it("has one for each bucket", function() {
                expect(this.boxes.length).toBe(3);
            });

            it("draws them in order from top to bottom", function() {
                expect(this.boxes).toBeOrderedTopToBottom();
            });

            it("have the corrects widths", function() {
                expect(width(this.boxes[2])).toBeGreaterThan(width(this.boxes[1]));
                expect(width(this.boxes[1])).toBeGreaterThan(width(this.boxes[0]));
            })

            it("have the same heights", function() {
                expect(height(this.boxes[2])).toEqual(height(this.boxes[1]));
                expect(height(this.boxes[1])).toEqual(height(this.boxes[0]));
            })

            it("draws them with some padding in between", function() {
                _.each(this.boxes, function(rect, i) {
                    if (i === 0) return;
                    expect(bottomY(rect)).toBeLessThan(topY(this.boxes[i - 1]) + 5);
                }, this);
            });

            it("centers the rectangles on the y axis ticks", function() {
                var yTicks = this.view.$(".yaxis .tick");
                _.each(this.boxes, function(rect, i) {
                    expect(centerY(rect)).toBeCloseTo(centerY(yTicks[i]), 1);
                }, this);
            });
        });

        it("draws vertical grid lines", function() {
            expect(this.view.$(".xaxis line.grid").length).toBeGreaterThan(1)
        })
        
        it("does not draw horizontal grid lines", function() {
            expect(this.view.$(".yaxis line.grid").length).toBe(0)
        })

        it("draws the grid lines after the rectangles", function() {
            var gridRect = this.view.$(".plot rect, line.grid");
            expect($(gridRect[0]).attr("class")).not.toBe("grid")
            expect($(gridRect[gridRect.length-1]).attr("class")).toBe("grid")
        })
    });

});
