chorus.views.visualizations.Frequency = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");

        var data = new chorus.presenters.visualizations.Frequency(this.model).present();
        var buckets = _.pluck(data, 'bucket');

        var counts = _.pluck(data, 'count')

        var svg = d3.select(this.el).append("svg").
            attr("class", "chart frequency").
            attr("width", 925).
            attr("height", 340);

        this.axes = new chorus.views.visualizations.Axes({
            el: svg,
            minXValue: 0,
            maxXValue: _.max(counts),
            xScaleType: "numeric",
            yLabels: buckets,
            xAxisLabel: "count",
            yAxisLabel: this.model.get("chart[yAxis]"),
            ticks: true,
            hasXGrids: true
        });

        if (!$el.isOnDom()) return;

        this.axes.render();
        var scales = this.axes.scales();

        var plot = svg.append("svg:g").attr("class", "plot");

        var boxHeight = Math.abs(scales.y.rangeBand()*0.8);
        var boxOffset = Math.abs(scales.y.rangeBand()*0.1);

        plot.selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("x", scales.x.range()[0])
            .attr("y", function(row) {
                return scales.y(row.bucket)+scales.y.rangeBand()+boxOffset;
            })
            .attr("height", boxHeight)
            .attr("width", function(row) {
                return scales.x(row.count) - scales.x(0);
            });
        svg.select(".xaxis").remove()
        svg.select(".yaxis").remove()
        this.axes.render();

        this.postRender();
    }
});

