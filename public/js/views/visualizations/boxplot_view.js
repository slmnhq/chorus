chorus.views.visualizations.BoxPlot = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");

        var xLabelHeight = 8;
        var yLabelWidth = 18;
        var data = new chorus.presenters.visualizations.Boxplot(this.model, {
            x: this.options.x,
            y: this.options.y
        }).present();

        var chart = d3.select(this.el).append("svg").
            attr("class", "chart box_plot").
            attr("viewBox", "0 0 272 100").
            append("g").
            attr("class", "top_transform");

        var xPaddedScaler = d3.scale.ordinal().
            domain(_.pluck(data, "name")).
            rangeBands([yLabelWidth + 2, 270]);


        var xEdgeScaler = d3.scale.ordinal().
            domain(_.pluck(data, "name")).
            rangeBands([yLabelWidth, 272]);

        var yPaddedScaler = d3.scale.linear().
            domain([data.minY, data.maxY]).
            range([98 - xLabelHeight, 2]);

        var yEdgeScaler = d3.scale.linear().
            domain([data.minY, data.maxY]).
            range([100 - xLabelHeight, 0]);

        chart.selectAll("line.ytick").data(yPaddedScaler.ticks(10)).enter().
            append("line").
            attr("class", "ytick").
            attr("y1", yPaddedScaler).
            attr("y2", yPaddedScaler).
            attr("x1", xPaddedScaler.rangeExtent()[0]).
            attr("x2", xPaddedScaler.rangeExtent()[1]);

        chart.selectAll("text.ytick_label").data(yPaddedScaler.ticks(10)).enter().
            append("text").attr("class", "ytick_label").
            text(String).
            attr("text-anchor", "end").
            attr("x", yLabelWidth - 3).
            attr("y", yPaddedScaler);

        var boxes = chart.selectAll("g.box").data(data).enter().
            append("g").
            attr("class", "box");

        var boxWidth = xPaddedScaler.rangeBand() * 0.2;
        var boxOffset = xPaddedScaler.rangeBand() * 0.4;

        boxes.append("line").
            attr("class", "whisker vertical").
            attr("x1",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset + 0.5 * boxWidth
            }).
            attr("x2",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset + 0.5 * boxWidth
            }).
            attr("y1",
            function(d) {
                return yPaddedScaler(d.min)
            }).
            attr("y2", function(d) {
                return yPaddedScaler(d.max)
            });

        boxes.append("line").
            attr("class", "whisker horizontal top").
            attr("x1",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset + 0.25 * boxWidth
            }).
            attr("x2",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset + 0.75 * boxWidth
            }).
            attr("y1",
            function(d) {
                return yPaddedScaler(d.max)
            }).
            attr("y2", function(d) {
                return yPaddedScaler(d.max)
            });

        boxes.append("line").
            attr("class", "whisker horizontal bottom").
            attr("x1",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset + 0.25 * boxWidth
            }).
            attr("x2",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset + 0.75 * boxWidth
            }).
            attr("y1",
            function(d) {
                return yPaddedScaler(d.min)
            }).
            attr("y2", function(d) {
                return yPaddedScaler(d.min)
            });

        boxes.append("rect").
            attr("width", boxWidth).
            attr("height",
            function(d) {
                return Math.abs(yPaddedScaler(d.thirdQuartile) - yPaddedScaler(d.firstQuartile))
            }).
            attr("x",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset
            }).
            attr("y",
            function(d) {
                return yPaddedScaler(d.thirdQuartile)
            }).
            attr("name", function(d) {
                return d.name
            });

        boxes.append("line").
            attr("class", "median").
            attr("x1",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset
            }).
            attr("x2",
            function(d) {
                return xPaddedScaler(d.name) + boxOffset + boxWidth
            }).
            attr("y1",
            function(d) {
                return yPaddedScaler(d.median)
            }).
            attr("y2", function(d) {
                return yPaddedScaler(d.median)
            });

        chart.append("line").
            attr("class", "yaxis").
            attr("x1", xEdgeScaler.rangeExtent()[0]).
            attr("x2", xEdgeScaler.rangeExtent()[0]).
            attr("y1", yEdgeScaler.range()[0]).
            attr("y2", yEdgeScaler.range()[1]);
        chart.append("line").
            attr("class", "xaxis").
            attr("x1", xEdgeScaler.rangeExtent()[0]).
            attr("x2", xEdgeScaler.rangeExtent()[1]).
            attr("y1", yEdgeScaler.range()[0]).
            attr("y2", yEdgeScaler.range()[0]);


        return this;
    }
});

