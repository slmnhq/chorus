;(function(chorus) {
    chorus.views.visualizations.Heatmap = chorus.views.Base.extend({
        render: function() {
            var $el = $(this.el);
            $el.addClass("visualization");

            // var data = new chorus.presenters.visualizations.Heatmap(this.model).present();

            var chart = d3.select(this.el).append("svg").
                attr("class", "chart heatmap").
                attr("viewBox", "0 0 272 100").
                append("g").
                attr("class", "top_transform");
        }
    });

    chorus.chart.heatmap = function(canvas, data, config) {
        var chart = new Heatmap(canvas, data, config);
        chart.layout.render();

        var max = d3.max(_.map(data, function(d) {
            return d.value;
        }));
        var fill = d3.scale.linear().domain([0, max]).range(["white", "steelblue"]);

        chart.canvas.append("svg:g")
            .attr("class", "plot")
            .selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("x", function(d) {
                return chart.scales.x(d.xLabel);
            })
            .attr("y", function(d) {
                return chart.scales.y(d.yLabel) + chart.scales.y.rangeBand();
            })
            .attr("width", function(d) {
                return chart.scales.x.rangeBand();
            })
            .attr("height", function(d) {
                return Math.abs(chart.scales.y.rangeBand());
            })
            .style("stroke", "white")// TODO: move to css
            .style("stroke-width", "0")// TODO: move to css
            .style("fill", function(d, i) {
                return fill(d.value);
            });
    };

    function Heatmap(canvas, data, config) {
        this.type = 'heatmap';
        this.canvas = canvas;
        this.data = data;

        var xLabels = _.uniq(_.map(data, function(datum) {
            return datum.xLabel
        }));
        var yLabels = _.uniq(_.map(data, function(datum) {
            return datum.yLabel
        }));

        this.labels =  {
            x : _.map(xLabels, function(d) {return {locator : d, label : d}}),
            y : _.map(yLabels, function(d) {return {locator : d, label : d}})
        };

        this.scales = {
            x : d3.scale.ordinal().domain(_.map(this.labels.x, function(d) {return d.locator})),
            y : d3.scale.ordinal().domain(_.map(this.labels.y, function(d) {return d.locator}))
        };

        this.axes = {
            x : new chorus.views.visualizations.Axis(this, { title : config.xAxisTitle || 'x axis', padding : 0, rangeType : 'rangeBands', from : "y", to : "right" }).south(),
            y : new chorus.views.visualizations.Axis(this, { title : config.yAxisTitle || 'y axis', rangeType : 'rangeBands', from : "height", to : "top" }).west()
        }

        this.layout = new chorus.views.visualizations.Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }
})(chorus);
