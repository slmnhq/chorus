chorus.views.visualizations.Heatmap = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");

        var data = new chorus.presenters.visualizations.Heatmap(this.model).present();
        var xLabels = _.uniq(_.pluck(data, 'xLabel'));
        var yLabels = _.uniq(_.pluck(data, 'yLabel'));

        var svg = d3.select(this.el).append("svg").
            attr("class", "chart heatmap").
            attr("width", 925).
            attr("height", 340);

        this.axes = new chorus.views.visualizations.Axes({
            el: svg,
            xLabels: xLabels,
            yLabels: yLabels,
            xAxisLabel: this.model.get("xAxis"),
            yAxisLabel: this.model.get("yAxis"),
            ticks: true
        });

        if (!$el.isOnDom()) return;

        this.axes.render();
        var scales = this.axes.scales();
        var fillScale = d3.scale.linear().domain([data.minValue, data.maxValue]).range(["white", "steelblue"]);

        var content = svg.append("svg:g").attr("class", "content");
        content.selectAll(".bin").data(data).enter()
            .append("svg:rect")
            .attr("class", "bin")
            .attr("x", function(row) { return scales.x(row.xLabel) })
            .attr("y", function(row) { return scales.y(row.yLabel) + scales.y.rangeBand() })
            .attr("height", Math.abs(scales.y.rangeBand()))
            .attr("width", scales.x.rangeBand())
            .style("fill", function(row, i) {
                return fillScale(row.value);
            });
    }
});
