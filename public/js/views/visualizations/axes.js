chorus.views.visualizations.XAxis = function(options) {
    this.labels   = options.labels;
    this.width    = options.el.attr("width");
    this.height   = options.el.attr("height");
    this.container = options.el;

    this.paddingX = options.paddingX || 20;
    this.paddingY = options.paddingY || 20;
    this.tickLength = options.tickLength || 5;
    this.labelSpacing = options.labelSpacing || 10;

    this.scaler = d3.scale.ordinal()
    .domain(this.labels)
    .rangeBands([this.paddingX, this.width - this.paddingX]);
};

_.extend(chorus.views.visualizations.XAxis.prototype, {
    originY: function() {
        this.el = this.container.append("svg:g").attr("class", "xaxis");
        var testLabels = this.el.selectAll(".label.test-origin-y")
            .data(this.labels).enter()
            .append("svg:text")
            .attr("class", "label test-origin-y")
            .text(function(d) {
                return d
            });

        var height = this.el.selectAll(".label")[0][0].getBBox().height + this.labelSpacing + this.tickLength
        testLabels.remove();
        return this.height - this.paddingY - height;
    },

    render: function() {
        var self = this;
        this.el = this.container.append("svg:g").attr("class", "xaxis");

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
                var width = this.getBBox().width;
                return left - (width / 2);
            })
            .attr("y", this.height - this.paddingY);

        var labelHeight = this.el.selectAll(".label")[0][0].getBBox().height;
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
    this.container = options.el;
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
    originX: function() {
        this.el = this.container.append("svg:g").attr("class", "yaxis");
        var testLabels = this.el.selectAll(".label.test-origin-x")
            .data(this.labels).enter()
            .append("svg:text")
            .attr("class", "label")
            .text(function(d) {
                return d
            });
        var maxWidth = _.max(_.map(this.el.selectAll(".label")[0], function(label) {
            return label.getBBox().width
        }))

        var width = maxWidth + this.labelSpacing + this.tickLength
        testLabels.remove();
        return this.paddingX + width;
    },

    render : function() {
        var self = this;
        this.el = this.container.append("svg:g").attr("class", "yaxis");

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
                var scalePoint = self.scaler(d);
                var height = this.getBBox().height;
                return scalePoint + (height / 4);
            });

        var labelWidth = _.max(_.map(this.el.selectAll(".label")[0], function(label) {
            return label.getBBox().width;
        }));

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

chorus.views.visualizations.Axes = function(options) {
    this.xAxis = new chorus.views.visualizations.XAxis({ el: options.el, labels: options.xLabels})
    this.yAxis = new chorus.views.visualizations.YAxis({ el: options.el, labels: options.xLabels})
}

_.extend(chorus.views.visualizations.Axes.prototype, {
    render: function() {
        this.xAxis.render()
        this.yAxis.render()
    }
})
