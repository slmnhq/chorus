chorus.views.visualizations.NewAxis = function(options) {
    this.el       = options.el;
    this.labels   = options.labels;
    this.width    = this.el.attr("width");
    this.height   = this.el.attr("height");
    this.paddingX = options.paddingX || 20;
    this.paddingY = options.paddingY || 20;
    this.tickLength = options.tickLength || 5;
    this.labelSpacing = options.labelSpacing || 10;

    this.scaler = d3.scale.ordinal()
    .domain(this.labels)
    .rangeBands([this.paddingX, this.width - this.paddingX]);
};

_.extend(chorus.views.visualizations.NewAxis.prototype, {
    render: function() {
        var self = this;

        // draw labels
        this.el.selectAll(".label")
        .data(this.labels).enter()
        .append("svg:text")
        .attr("class", "label")
        .attr("y", 0)
        .attr("x", 0)
        .text(function(d) {
            return d
        });

        // reposition labels now that we know their width
        this.el.selectAll(".label")
        .attr("x", function(d) {
            var left = self.scaler(d);
            var width = $(this).width();
            return left - (width / 2);
        })
        .attr("y", this.height - this.paddingY);

        var labelHeight = $(this.el.selectAll(".label")[0][0]).height();
        var labelTop = this.height - this.paddingY - labelHeight;
        var tickBottom = labelTop - this.labelSpacing;
        var tickTop    = tickBottom - this.tickLength;

        // draw ticks
        this.el.selectAll(".tick")
        .data(this.labels).enter()
        .append("svg:line")
        .attr("class", "tick")
        .attr("y1", tickTop)
        .attr("y2", tickBottom)
        .attr("x1", this.scaler)
        .attr("x2", this.scaler);

        // draw main axis line
        this.el.append("svg:line")
        .attr("class", "axis")
        .attr("x1", this.paddingX)
        .attr("x2", this.width - this.paddingX)
        .attr("y1", tickTop)
        .attr("y2", tickTop);
    }
});

