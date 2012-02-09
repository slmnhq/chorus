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

        plot.selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("x", scales.x.range()[0])
            .attr("y", function(row) {
                return scales.y(row.bucket)+scales.y.rangeBand();
            })
            .attr("height", Math.abs(scales.y.rangeBand()))
            .attr("width", function(row) {
                return scales.x(row.count) - scales.x(0);
            });
        this.axes.render();

        this.postRender();
    }
});

