chorus.views.visualizations.Histogram = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");

        var data = new chorus.presenters.visualizations.Histogram(this.model).present();

        var bins = _.pluck(data, 'bin');

        var frequencies = _.pluck(data, 'frequency')

        var svg = d3.select(this.el).append("svg").
            attr("class", "chart histogram").
            attr("width", 925).
            attr("height", 340);

        this.axes = new chorus.views.visualizations.Axes({
            el: svg,
            minYValue: 0,
            maxYValue: _.max(frequencies),
            xScaleType: "ordinal",
            yScaleType: "numeric",
            xLabels: bins,
            yAxisLabel: "count",
            xAxisLabel: this.model.get("chart[xAxis]"),
            ticks: true,
            hasYGrids: true
        });

        if (!$el.isOnDom()) return;

        this.axes.render();
        var scales = this.axes.scales();

        var plot = svg.append("svg:g").attr("class", "plot");

        var barWidth = scales.x.rangeBand() * 0.6;
        var barOffset = scales.x.rangeBand() * 0.2;

        plot
            .selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return (scales.x(d.bin) + barOffset)
            })
            .attr("width", barWidth)
            .attr("y", function(d) {
                return scales.y(d.frequency)
            })
            .attr("height", function(d) {
                return scales.y(0) - scales.y(d.frequency)
            })

        svg.select(".xaxis").remove()
        svg.select(".yaxis").remove()
        this.axes.render();
   }

});

