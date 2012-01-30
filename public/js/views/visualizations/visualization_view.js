chorus.views.visualizations = {};

chorus.views.visualizations.TimeSeriesPlot = chorus.views.Base.extend({
    render: function() {
        $(this.el).addClass("visualization");

        var data = new chorus.presenters.visualizations.XY(this.model, {
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

chorus.views.visualizations.BoxPlot = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");

        var data = new chorus.presenters.visualizations.Boxplot(this.model, {
            x: this.options.x,
            y: this.options.y
        }).present();

        var chart = d3.select(this.el).append("svg").
            attr("class", "chart box_plot").
            attr("viewBox", "0 0 272 100").
            append("g").
                attr("class", "top_transform").
                attr("transform", "scale(1,-1) translate(0,-100)");

        var xScaler = d3.scale.ordinal().
            domain(_.pluck(data, "name")).
            rangeBands([0, 272]);

        var yScaler = d3.scale.linear().
           domain([data.minY, data.maxY]).
           range([2, 98]);

        var yBoundsScaler = d3.scale.linear().
           domain([data.minY, data.maxY]).
           range([0, 100]);


        chart.selectAll("line.ytick").data(yScaler.ticks(10)).enter().
            append("line").
            attr("class", "ytick").
            attr("y1", yScaler).
            attr("y2", yScaler).
            attr("x1", xScaler.rangeExtent()[0]).
            attr("x2", xScaler.rangeExtent()[1]);

        var boxes = chart.selectAll("g.box").data(data).enter().
            append("g").
            attr("class", "box");

        var boxWidth = xScaler.rangeBand() * 0.2;
        var boxOffset = xScaler.rangeBand() * 0.4;

        boxes.append("line").
            attr("class", "whisker vertical").
            attr("x1", function(d){return xScaler(d.name)+boxOffset+0.5*boxWidth}).
            attr("x2", function(d){return xScaler(d.name)+boxOffset+0.5*boxWidth}).
            attr("y1", function(d){return yScaler(d.min)}).
            attr("y2", function(d){return yScaler(d.max)});

        boxes.append("line").
            attr("class", "whisker horizontal top").
            attr("x1", function(d){return xScaler(d.name)+boxOffset+0.25*boxWidth}).
            attr("x2", function(d){return xScaler(d.name)+boxOffset+0.75*boxWidth}).
            attr("y1", function(d){return yScaler(d.max)}).
            attr("y2", function(d){return yScaler(d.max)});

        boxes.append("line").
            attr("class", "whisker horizontal bottom").
            attr("x1", function(d){return xScaler(d.name)+boxOffset+0.25*boxWidth}).
            attr("x2", function(d){return xScaler(d.name)+boxOffset+0.75*boxWidth}).
            attr("y1", function(d){return yScaler(d.min)}).
            attr("y2", function(d){return yScaler(d.min)});

        boxes.append("rect").
            attr("width", boxWidth).
            attr("height", function(d) { return yScaler(d.q3) - yScaler(d.q1) }).
            attr("x", function(d) { return xScaler(d.name) + boxOffset}).
            attr("y", function(d) { return yScaler(d.q1) }).
            attr("name", function(d) {return d.name});

        boxes.append("line").
            attr("class", "median").
            attr("x1", function(d) { return xScaler(d.name) + boxOffset}).
            attr("x2", function(d) { return xScaler(d.name) + boxOffset+boxWidth}).
            attr("y1", function(d){return yScaler(d.median)}).
            attr("y2", function(d){return yScaler(d.median)});

        chart.append("line").
            attr("class", "yaxis").
            attr("x1", xScaler.rangeExtent()[0]).
            attr("x2", xScaler.rangeExtent()[0]).
            attr("y1", yBoundsScaler.range()[0]).
            attr("y2", yBoundsScaler.range()[1]);
        chart.append("line").
            attr("class", "xaxis").
            attr("x1", xScaler.rangeExtent()[0]).
            attr("x2", xScaler.rangeExtent()[1]).
            attr("y1", yBoundsScaler.range()[0]).
            attr("y2", yBoundsScaler.range()[0]);


        return this;
    }
});
