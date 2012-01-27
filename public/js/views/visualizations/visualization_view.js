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
                attr("class", "chart time_series").
                attr("height", "500px").
                attr("width", "100%").
                attr("viewBox", "0 0 100 100");

            var xScaler = d3.scale.linear().
                domain([data.minX, data.maxX]).
                range(["2", "98"]);
            var yScaler = d3.scale.linear().
                domain([data.minY, data.maxY]).
                range(["98", "2"]);

            var line = d3.svg.line().
                x(function(d) { return xScaler(d.x); }).
                y(function(d) { return yScaler(d.y); });

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
