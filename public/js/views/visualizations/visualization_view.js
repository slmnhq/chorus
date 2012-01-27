;(function(ns) {
    ns.views.visualizations = {};

    ns.views.visualizations.XY = ns.views.Base.extend({
        render: function() {
            var $el = $(this.el);
            $el.addClass("visualization");

            var data = new ns.presenters.visualizations.XY(this.model, {
                x: this.options.x,
                y: this.options.y
            }).present();

            var chart = d3.selectAll(this.el).append("svg").
                attr("class", "chart").
                attr("height", "300px").
                attr("width", "100%").
                // attr("preserveAspectRatio", "none").
                attr("viewBox", "0 0 100 100");

            var maxX = _.max(_.pluck(data, 0));
            var maxY = _.max(_.pluck(data, 1));
            var minX = _.min(_.pluck(data, 0));
            var minY = _.min(_.pluck(data, 1));

            var x = d3.scale.linear().
                domain([minX, maxX]).
                range(["2", "98"]);
            var y = d3.scale.linear().
                domain([minY, maxY]).
                range(["2", "98"]);

            var line = d3.svg.line().
                x(function(d) { return x(d[0]); }).
                y(function(d) { return y(d[1]); });

            var points = _.map(data, function(pair) {
                return x(pair[0]) + " " + y(pair[1]);
            }).join(",");

            chart.selectAll("line.xtick").data(x.ticks(10)).enter().
                append("line").
                attr("class", "xtick").
                attr("x1", x).
                attr("x2", x).
                attr("y1", y.range()[0]).
                attr("y2", y.range()[1]).
                style("stroke", "#aaa");

            chart.selectAll("line.ytick").data(y.ticks(10)).enter().
                append("line").
                attr("class", "ytick").
                attr("y1", y).
                attr("y2", y).
                attr("x1", x.range()[0]).
                attr("x2", x.range()[1]).
                style("stroke", "#777");

            chart.selectAll("circle").data(data).enter().
                append("circle").
                attr("r", 4).
                attr("cx", function(d) { return x(d[0]); }).
                attr("cy", function(d) { return y(d[1]); }).
                style("fill", "black");

            chart.append("svg:polyline").
                attr("points", points).
                style("fill", "none").
                style("stroke", "blue");

            return this;
        }
    });

    ns.views.visualizations.Boxplot = ns.views.Base.extend({
        render: function() {
            var $el = $(this.el);
            $el.addClass("visualization");

            var data = new ns.presenters.visualizations.Boxplot(this.model, {
                x: this.options.x,
                y: this.options.y
            }).present();

            // render actual chart here

            return this;
        }
    });
})(chorus);
