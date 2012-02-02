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

        var xLabelHeight = 32;
        var yLabelWidth = 75;
        var xPadding = 8;
        var yPaddingTop = 20;
        var viewWidth = 925;
        var viewHeight = 340;
        var data = new chorus.presenters.visualizations.Histogram(this.model).present();
        var x = _.pluck(data, "x");
        var y = _.pluck(data, "y");


        var chart = d3.select(this.el).append("svg").
            attr("class", "chart histogram").
//            attr("viewBox", "0 0 "+ viewWidth +" "+ viewHeight).
            append("g").
            attr("class", "top_transform");

        var xPaddedScaler = d3.scale.ordinal().
            domain(x).
            rangeBands([yLabelWidth + xPadding, viewWidth - xPadding]);

        var xEdgeScaler = d3.scale.ordinal().
            domain(x).
            rangeBands([yLabelWidth, viewWidth]);

        var yPaddedScaler = d3.scale.linear().
            domain([_.min(y), _.max(y)]).
            range([viewHeight - xLabelHeight, yPaddingTop]);

        var yEdgeScaler = d3.scale.linear().
            domain([_.min(y), _.max(y)]).
            range([viewHeight - xLabelHeight, 0]);

        var bars = chart.selectAll("bar").data(data).enter().append("g").
            attr("class", "bar");

        var boxWidth = xPaddedScaler.rangeBand() * 0.6;
        var boxOffset = xPaddedScaler.rangeBand() * 0.2;

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
//
//        var xAxis = d3.svg.axis().scale(xEdgeScaler).tickSize(x.length).tickSubdivide(true).orient("bottom");
//        var yAxis = d3.svg.axis().scale(yPaddedScaler).ticks(5).orient("right");
//
//        chart.append("svg:g")
//            .attr("class", "x_axis")
////            .attr("transform", "translate(0," + (320)+ ")")
//            .call(xAxis);
//        chart.append("svg:g")
//            .attr("class", "y_axis")
//            .call(yAxis);

//        chart.selectAll("text").attr("style", "font-size: 11px")
        return this;
    }
});

chorus.views.visualizations.HistogramPlotBeta = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");
        var data = new chorus.presenters.visualizations.Histogram(this.model).present();
        chorus.chart.histogram(
            this.chartArea(this.el),
            data,
            {}
        );
    },

    chartArea : function(el) {
        this.plotWidth = 925;
        this.plotHeight = 340;
        
        return d3.select(el)
            .append("svg:svg")
            .attr("class", "chart")
            .attr("width", this.plotWidth)
            .attr("height", this.plotHeight)
            .append("svg:g")
            .attr("class", "plot")
            .attr("width", this.plotWidth)
            .attr("height", this.plotHeight);
    }
});

