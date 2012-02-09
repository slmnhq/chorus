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
                { bucket: 'aardvark',   count: 4000},
                { bucket: 'beluga',     count: 500},
                { bucket: 'chupacabra', count: 10000}
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

        describe("the count rectangles", function() {
           it("has one for each bucket", function() {
               expect(this.boxes.length).toBe(3);
           });

            it("draws them in order from top to bottom", function() {
               expect(this.boxes).toBeOrderedTopToBottom();
            });
        });
    });

});
