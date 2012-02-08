chorus.views.visualizations.XAxis = function(options) {
    this.labels   = options.labels;
    this.axisLabel = options.axisLabel;
    this.width    = options.el.attr("width");
    this.height   = options.el.attr("height");
    this.container = options.el;

    this.paddingX = options.paddingX || 20;
    this.paddingY = options.paddingY || 20;
    this.offsetX = options.offsetX   || 0;
    this.tickLength = options.tickLength || 5;
    this.labelSpacing = options.labelSpacing || 10;

};

_.extend(chorus.views.visualizations.XAxis.prototype, {
    requiredBottomSpace: function() {
        this.el = this.container.append("svg:g").attr("class", "xaxis");
        var testTickLabels = this.el.selectAll(".label")
            .data(this.labels).enter()
            .append("svg:g")
            .attr("class", "label")
            .append("svg:text")
            .text(function(d) {
                return d
            });

        this.rotateTickLabelsIfNeeded();

        var testAxisLabel = this.el.append("svg:text")
            .text(this.axisLabel)
            .attr("class", "axis_label");

        var height = this.tickLabelHeight() + this.axisLabelHeight() + 2*this.labelSpacing + this.tickLength;
        this.el.remove();
        return height;
    },

    tickLabelHeight: function() {
        return _.max(_.map(this.el.selectAll(".label")[0], function(label) {
            return label.getBBox().height;
        }))
    },

    axisLabelHeight: function() {
        return this.el.selectAll(".axis_label")[0][0].getBBox().height;
    },

    scale: function() {
        return d3.scale.ordinal()
            .domain(this.labels)
            .rangeBands([this.paddingX + this.offsetX, this.width - this.paddingX]);
    },

    rotateTickLabelsIfNeeded: function() {
        var bandWidth = this.scale().rangeBand() / 2;
        var tickLabels = this.el.selectAll(".label text");
        var needToRotate = _.any(tickLabels[0], function(label) {
            return label.getBBox().width > bandWidth;
        });

        if (needToRotate) {
            var maxWidth = _.max(_.map(tickLabels[0], function(tickLabel){ return tickLabel.getBBox().width; }));
            var angle = 290;
            var translationY = Math.sin(angle * Math.PI / 180) * maxWidth;

            tickLabels.attr("transform", function() {
                var box = this.getBBox();
                var rightX = box.x + box.width;
                var centerY = box.y + box.height / 2;
                var translation = "translate(" + (-0.5 * box.width) + " " + translationY + ") ";
                var rotation = "rotate(" + angle + " " + rightX + " " + centerY + ")";
                return translation + rotation;
            });
        }
    },

    render: function() {
        var scale = this.scale();
        var centerScale = function(d) { return scale(d) + scale.rangeBand() / 2 };

        var self = this;
        this.el = this.container.append("svg:g").attr("class", "xaxis");

        // draw axis label
        var axisLabel = this.el.append("svg:text")
            .text(this.axisLabel)
            .attr("x", 0)
            .attr("y", this.height - this.paddingY)
            .attr("class", "axis_label")

        // reposition axis label now that we know its width
        var axisLabelWidth = axisLabel[0][0].getBBox().width
        var centerX = (scale.rangeExtent()[0] + scale.rangeExtent()[1]) / 2 - axisLabelWidth / 2;
        this.el.select(".axis_label").attr("x", centerX)

        // draw tick labels
        var tickLabelBottom = this.height - this.paddingY - this.labelSpacing - this.axisLabelHeight();
        var tickLabels = this.el.selectAll(".label")
            .data(this.labels).enter()
            .append("svg:g")
            .attr("class", "label")
            .append("svg:text")
            .attr("y", tickLabelBottom)
            .attr("x", 0)
            .text(function(d) {
                return d
            });

        // reposition labels now that we know their width
        tickLabels
            .attr("x", function(d) {
                var left = centerScale(d);
                var width = this.getBBox().width;
                return left - (width / 2);
            });

        this.rotateTickLabelsIfNeeded();

        // bounding boxes
        // _.each(tickLabels[0], function(label) {
        //     var box = $(label).parent()[0].getBBox();
        //     this.el.append("svg:rect")
        //         .attr("x", box.x)
        //         .attr("y", box.y)
        //         .attr("width", box.width)
        //         .attr("height", box.height)
        //         .style("fill", "none");
        // }, this);

        var tickBottom = tickLabelBottom - this.tickLabelHeight() - this.labelSpacing;
        var tickTop    = tickBottom - this.tickLength;

        // draw ticks
        this.el.selectAll(".tick")
            .data(this.labels).enter()
            .append("svg:line")
            .attr("class", "tick")
            .attr("y1", tickTop)
            .attr("y2", tickBottom)
            .attr("x1", centerScale)
            .attr("x2", centerScale)

        // draw main axis line
        this.el.append("svg:line")
            .attr("class", "axis")
            .attr("x1", this.paddingX + this.offsetX)
            .attr("x2", this.width - this.paddingX)
            .attr("y1", tickTop)
            .attr("y2", tickTop);
    }
});

chorus.views.visualizations.YAxis = function(options) {
    this.container = options.el;
    this.labels   = options.labels;
    this.axisLabel = options.axisLabel;
    this.width    = options.el.attr("width");
    this.height   = options.el.attr("height");
    this.paddingX = options.paddingX || 20;
    this.paddingY = options.paddingY || 20;
    this.offsetY  = options.offsetY  || 0;
    this.tickLength = options.tickLength || 10;
    this.labelSpacing = options.labelSpacing || 10;
};

_.extend(chorus.views.visualizations.YAxis.prototype, {
    requiredLeftSpace: function() {
        this.el = this.container.append("svg:g").attr("class", "yaxis");
        var testLabels = this.el.selectAll(".label.test-origin-x")
            .data(this.labels).enter()
            .append("svg:text")
            .attr("class", "label")
            .text(function(d) {
                return d
            });
        var testAxisLabel = this.el.append("svg:g")
            .attr("class", "axis_label")
            .append("svg:text")
            .attr("x", 0)
            .attr("y", 0)
            .text(this.axisLabel)
        var axisLabelHeight  = testAxisLabel[0][0].getBBox().height;
        var width = axisLabelHeight + this.labelWidth() + 2*this.labelSpacing + this.tickLength;

        testLabels.remove();
        testAxisLabel.remove();
        return width;
    },

    labelWidth: function() {
        return _.max(_.map(this.el.selectAll(".label")[0], function(label) {
            return label.getBBox().width
        }))
    },

    scale: function() {
        return d3.scale.ordinal()
            .domain(this.labels)
            .rangeBands([this.height - this.paddingY - this.offsetY, this.paddingY]);
    },

    render : function() {
        var self = this;
        this.el = this.container.append("svg:g").attr("class", "yaxis");

        var scale = this.scale()
        var centerScale = function(d) { return scale(d) + scale.rangeBand() / 2 };

        // draw axis label
        var axisLabelContainer = this.el.append("svg:g")
            .attr("class", "axis_label")
        var axisLabel = axisLabelContainer.append("svg:text")
            .attr("x", 0)
            .attr("y", 0)
            .text(this.axisLabel)

        // reposition axis label now that we know its height
        var centerY = (scale.rangeExtent()[0] + scale.rangeExtent()[1]) / 2
        var axisLabelBox    = axisLabel[0][0].getBBox();
        var axisLabelWidth  = axisLabelBox.width;
        var axisLabelHeight = axisLabelBox.height;
        axisLabel
            .attr("transform", "rotate(270)")
            .attr("x", -1 * (centerY + axisLabelWidth / 2))
            .attr("y", this.paddingX + axisLabelHeight)

        var tickLabelLeft = this.paddingX + axisLabelHeight + this.labelSpacing;

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
            .attr("x", tickLabelLeft)
            .attr("y", function(d) {
                var scalePoint = centerScale(d);
                var height = this.getBBox().height;
                return scalePoint + (height / 4);
            });

        var tickLeft  = tickLabelLeft + this.labelWidth() + this.labelSpacing;
        var tickRight = tickLeft + this.tickLength;

        // draw ticks
        this.el.selectAll(".tick")
            .data(this.labels).enter()
            .append("svg:line")
            .attr("class", "tick")
            .attr("y1", centerScale)
            .attr("y2", centerScale)
            .attr("x1", tickLeft)
            .attr("x2", tickRight);

        // draw main axis line
        this.el.append("svg:line")
            .attr("class", "axis")
            .attr("y1", this.height - this.paddingY - this.offsetY)
            .attr("y2", this.paddingY)
            .attr("x1", tickRight)
            .attr("x2", tickRight);
    }
});

chorus.views.visualizations.Axes = function(options) {
    this.xAxis = new chorus.views.visualizations.XAxis({ el: options.el, labels: options.xLabels, axisLabel: options.xAxisLabel });
    this.yAxis = new chorus.views.visualizations.YAxis({ el: options.el, labels: options.yLabels, axisLabel: options.yAxisLabel });
}

_.extend(chorus.views.visualizations.Axes.prototype, {
    scales: function() {
        return { x: this.xAxis.scale(), y: this.yAxis.scale() };
    },

    render: function() {
        this.xAxis.offsetX = this.yAxis.requiredLeftSpace();
        this.yAxis.offsetY = this.xAxis.requiredBottomSpace();

        this.xAxis.render()
        this.yAxis.render()
    }
})
