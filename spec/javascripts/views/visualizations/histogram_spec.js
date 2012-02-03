describe("chorus.views.visualizations.Histogram", function() {
    beforeEach(function() {
        this.task = new chorus.models.HistogramTask({
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
            ],
            "chart[xAxis]": "I am the x axis"
        });

        this.view = new chorus.views.visualizations.Histogram({
            model: this.task
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("has one bar for each bin", function() {
            expect(this.view.$(".bar").length).toBe(5);
        })

        it("renders no xtick lines by default", function() {
            expect(this.view.$(".axis.south .grid line").length).toBe(0);
        });

        it("renders ytick lines by default", function() {
            expect(this.view.$(".axis.west .grid line").length).toBeGreaterThan(1);
        });

        it("renders the y axis edge", function() {
            expect(this.view.$(".axis.west .axis_edge line")).toExist()
            expect(this.view.$(".axis.west .axis_edge line").attr("y1")).toBeGreaterThan(this.view.$(".axis.west .axis_edge line").attr("y2"))

        })

        it("labels the y axis ticks", function(){
            var labels = this.view.$(".axis.west .labels text")
            expect(labels.length).toBeGreaterThan(2)
            
            _.each (labels, function(l){
                expect(l.textContent <= 2000).toBeTruthy();
                expect(l.textContent >= 0).toBeTruthy();
            })
        })

        it("labels the x axis ticks", function(){
            var labels = _.pluck(this.view.$(".axis.south .labels text"), "textContent")
            var expectedLabels = _.pluck(this.task.get("rows"), "bin");
            expect(labels).toEqual(expectedLabels);
        })

        it ("labels the x axis", function(){
            expect(this.view.$(".axis.south .title").text()).toBe("I am the x axis")
        })

        it ("labels the y axis", function(){
            expect(this.view.$(".axis.west .title").text()).toBe("count")
        })

        it("does not render the x axis edge", function() {
            expect(this.view.$(".axis.south .axis_edge line")).not.toExist()
        })

        it("has correct heights on the bars", function() {
            var $bars = this.view.$("g.plot").find("rect")
            var heights = _.map($bars, function(bar){return $(bar).attr("height")})
            var sorted_heights = heights.slice(0).sort();
            expect(sorted_heights).toEqual([heights[2], heights[3], heights[0], heights[1], heights[4]])
        })

        it("has equal widths on the bars", function() {
            var $bars = this.view.$("g.plot").find("rect")
            var widths = _.map($bars, function(bar) {return $(bar).attr("width")})
            widths.sort()
            expect(widths[0]).toEqual(widths[widths.length-1])
        });

        it("starts the bars on/near the x axis", function() {
            var $bars = this.view.$("g.bar").find("rect")
            var bottomY = parseFloat($(this.view.$("line.xaxis")).attr("y1"))
            var bottoms = _.map($bars, function(bar) {
                expect(parseFloat($(bar).attr("y"))+parseFloat($(bar).attr("height"))).toBeCloseTo(bottomY)
            })
        })

    });
});

