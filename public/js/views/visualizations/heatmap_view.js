;(function(chorus) {
    chorus.views.visualizations.Heatmap = chorus.views.Base.extend({
        render: function() {
            var $el = $(this.el);
            $el.addClass("visualization");

            var data = new chorus.presenters.visualizations.Heatmap(this.model).present();

            var svg = d3.select(this.el).append("svg").
                attr("class", "chart heatmap").
                attr("width", 925).
                attr("height", 340);

            var axes = new chorus.views.visualizations.Axes({
                el: svg,
                xLabels: ['january', 'february', 'march', 'april'],
                yLabels: ['one', 'two', 'three', 'four', 'five'],
                paddingX: [],
                ticks: true
            });

            if ($el.isOnDom()) {
                axes.render();
                var scales = axes.scales();
            }

            // var config = {};
            // var chart = new Heatmap(svg, data, config);
            // chart.layout.render();

            // var fill = d3.scale.linear().domain([0, data.maxValue]).range(["white", "steelblue"]);

            // chart.canvas.append("svg:g")
            //     .attr("class", "plot")
            //     .selectAll("rect")
            //     .data(data)
            //     .enter().append("svg:rect")
            //     .attr("x", function(d) {
            //         return chart.scales.x(d.x);
            //     })
            //     .attr("y", function(d) {
            //         return chart.scales.y(d.y) + chart.scales.y.rangeBand();
            //     })
            //     .attr("width", function(d) {
            //         return chart.scales.x.rangeBand();
            //     })
            //     .attr("height", function(d) {
            //         return Math.abs(chart.scales.y.rangeBand());
            //     })
            //     .style("stroke", "white")// TODO: move to css
            //     .style("stroke-width", "0")// TODO: move to css
            //     .style("fill", function(d) {
            //         return fill(d.value);
            //     });
        }
    });

    function Heatmap(canvas, data, config) {
        this.type = 'heatmap';
        this.canvas = canvas;
        this.data = data;

        this.labels =  {
            x : _.map(data, function(d) { return { locator : d.x, label : d.xLabel }}),
            y : _.map(data, function(d) { return { locator : d.y, label : d.yLabel }})
        };

        this.scales = {
            x : d3.scale.ordinal().domain(_.map(this.labels.x, function(d) {return d.locator})),
            y : d3.scale.ordinal().domain(_.map(this.labels.y, function(d) {return d.locator}))
        };

        this.axes = {
            x : new chorus.views.visualizations.Axis(this, {
                title : config.xAxisTitle || 'x axis',
                rangeType : 'rangeBands',
                from : "y",
                to : "right",
                padding : 0
            }).south(),

            y : new chorus.views.visualizations.Axis(this, {
                title : config.yAxisTitle || 'y axis',
                rangeType : 'rangeBands',
                from : "height",
                to : "top"
            }).west()
        }

        this.layout = new chorus.views.visualizations.Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }
})(chorus);
