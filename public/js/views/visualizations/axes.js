chorus.views.visualizations.XAxis = function(options) {
    this.labels   = options.labels;
    this.width    = options.el.attr("width");
    this.height   = options.el.attr("height");
    this.el       = options.el.append("svg:g")
        .attr("class", "xaxis");
        // .attr("width", this.width)
        // .attr("height", this.height);
    this.paddingX = options.paddingX || 20;
    this.paddingY = options.paddingY || 20;
    this.tickLength = options.tickLength || 5;
    this.labelSpacing = options.labelSpacing || 10;

    this.scaler = d3.scale.ordinal()
    .domain(this.labels)
    .rangeBands([this.paddingX, this.width - this.paddingX]);
};

_.extend(chorus.views.visualizations.XAxis.prototype, {
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

chorus.views.visualizations.YAxis = function(options) {
    this.el       = options.el.append("svg:g").attr("class", "yaxis");
    this.labels   = options.labels;
    this.width    = options.el.attr("width");
    this.height   = options.el.attr("height");
    this.paddingX = options.paddingX || 20;
    this.paddingY = options.paddingY || 20;
    this.tickLength = options.tickLength || 10;
    this.labelSpacing = options.labelSpacing || 10;

    this.scaler = d3.scale.ordinal()
                          .domain(this.labels)
                          .rangeBands([this.height - this.paddingY, this.paddingY]);
};

_.extend(chorus.views.visualizations.YAxis.prototype, {
    render : function() {
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
            .attr("x", this.paddingX)
            .attr("y", function(d) {
                var center = self.scaler(d);
                var height = $(this).height();
                return center + (height / 2);
            });

        var labelWidth = $(this.el.selectAll(".label")[0][0]).width();
        var labelRight = this.paddingX + labelWidth;
        var tickLeft   = labelRight + this.labelSpacing;
        var tickRight  = tickLeft + this.tickLength;

        // draw ticks
        this.el.selectAll(".tick")
            .data(this.labels).enter()
            .append("svg:line")
            .attr("class", "tick")
            .attr("y1", this.scaler)
            .attr("y2", this.scaler)
            .attr("x1", tickLeft)
            .attr("x2", tickRight);

        // draw main axis line
        this.el.append("svg:line")
            .attr("class", "axis")
            .attr("y1", this.height - this.paddingY)
            .attr("y2", this.paddingY)
            .attr("x1", tickRight)
            .attr("x2", tickRight);
    }
});

