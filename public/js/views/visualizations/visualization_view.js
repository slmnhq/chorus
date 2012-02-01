chorus.views.visualizations = {};

chorus.views.visualizations.TimeseriesPlot = chorus.views.Base.extend({
    render: function() {
        $(this.el).addClass("visualization");

        var data = new chorus.presenters.visualizations.Timeseries(this.model, {
            x: this.options.x,
            y: this.options.y
        }).present();

        var chart = d3.select(this.el).append("svg").
            attr("class", "chart time_series").
            attr("viewBox", "0 0 270 100");

        var xScaler = d3.scale.linear().
            domain([data.minX, data.maxX]).
            range([2, 270]);
        var yScaler = d3.scale.linear().
            domain([data.minY, data.maxY]).
            range([98, 2]);

        var line = d3.svg.line().
            x(
            function(d) {
                return xScaler(d.x);
            }).
            y(function(d) {
                return yScaler(d.y);
            });

        chart.selectAll("line.xtick").data(xScaler.ticks(10)).enter().
            append("line").
            attr("class", "xtick").
            attr("x1", xScaler).
            attr("x2", xScaler).
            attr("y1", yScaler.range()[0]).
            attr("y2", yScaler.range()[1]);
        chart.selectAll("line.ytick").data(yScaler.ticks(10)).enter().
            append("line").
            attr("class", "ytick").
            attr("y1", yScaler).
            attr("y2", yScaler).
            attr("x1", xScaler.range()[0]).
            attr("x2", xScaler.range()[1]);

        chart.append("line").
            attr("class", "yaxis").
            attr("x1", xScaler.range()[0]).
            attr("x2", xScaler.range()[0]).
            attr("y1", yScaler.range()[0]).
            attr("y2", yScaler.range()[1]);
        chart.append("line").
            attr("class", "xaxis").
            attr("x1", xScaler.range()[0]).
            attr("x2", xScaler.range()[1]).
            attr("y1", yScaler.range()[0]).
            attr("y2", yScaler.range()[0]);

        chart.append("path").attr("d", line(data));

        return this;
    }
});

chorus.views.visualizations.HistogramPlot = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");

        var xLabelHeight = 8;
        var yLabelWidth = 18;
        var data = new chorus.presenters.visualizations.Histogram(this.model).present();
        var x = _.pluck(data, "x");
        var y = _.pluck(data, "y");


        var chart = d3.select(this.el).append("svg").
            attr("class", "chart histogram").
            attr("viewBox", "0 0 272 100").
            append("g").
            attr("class", "top_transform");

        var xPaddedScaler = d3.scale.ordinal().
            domain(x).
            rangeBands([yLabelWidth + 2, 270]);


        var xEdgeScaler = d3.scale.ordinal().
            domain(x).
            rangeBands([yLabelWidth, 272]);

        var yPaddedScaler = d3.scale.linear().
            domain([_.min(y), _.max(y)]).
            range([98 - xLabelHeight, 2]);

        var yEdgeScaler = d3.scale.linear().
            domain([_.min(y), _.max(y)]).
            range([100 - xLabelHeight, 0]);

        var bars = chart.selectAll("bar").data(data).enter().append("g").
            attr("class", "bar");

        var boxWidth = xPaddedScaler.rangeBand() * 0.2;
        var boxOffset = xPaddedScaler.rangeBand() * 0.4;

        bars.append("rect").
            attr("width", boxWidth).
            attr("height", function(d) { return Math.abs(yPaddedScaler(d.y)-yPaddedScaler(0)) }).
            attr("x", function(d) { return xPaddedScaler(d.x) + boxOffset}).
            attr("y", function(d) { return yPaddedScaler(d.y) }).
            attr("name", function(d) {return d.x});

        chart.selectAll("line.ytick").data(yPaddedScaler.ticks(10)).enter().
            append("line").
            attr("class", "ytick").
            attr("y1", yPaddedScaler).
            attr("y2", yPaddedScaler).
            attr("x1", xPaddedScaler.rangeExtent()[0]).
            attr("x2", xPaddedScaler.rangeExtent()[1]);

        return this;
    }
});
