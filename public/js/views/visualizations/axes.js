chorus.views.visualizations.Axis = function(options) {
    this._labels    = options.labels;
    this.axisLabel = options.axisLabel;
    this.hasGrids = options.hasGrids;
    this.width     = options.el.attr("width");
    this.height    = options.el.attr("height");
    this.container = options.el;
    this.scaleType = options.scaleType;

    this.minValue  = options.minValue;
    this.maxValue  = options.maxValue;

    this.paddingX = options.paddingX || 20;
    this.paddingY = options.paddingY || 20;
    this.offsetX = options.offsetX   || 0;
    this.offsetY = options.offsetY   || 0;
    this.tickLength = options.tickLength || 5;
    this.labelSpacing = options.labelSpacing || 10;
};

chorus.views.visualizations.Axis.extend = chorus.views.Base.extend;
_.extend(chorus.views.visualizations.Axis.prototype, chorus.Mixins.VisHelpers, {
    maxX: function() {
        return this.width - this.paddingX;
    },

    minX: function() {
        return this.paddingX + this.offsetX;
    },

    maxY: function() {
        return this.height - this.paddingY - this.offsetY;
    },

    minY: function() {
        return this.paddingY;
    },

    labels: function() {
        if (this.scaleType === "numeric") {
            return this.scale().ticks(8);
        } else {
            return this._labels;
        }
    },

    tickScale: function() {
        var scale = this.scale();
        if (this.scaleType === "numeric") {
            return scale;
        } else {
            return function(d) { return scale(d) + scale.rangeBand() / 2 };
        }
    },

    scale: function() {
        if (this.scaleType === "numeric") {
            return d3.scale.linear()
                .domain([this.minValue, this.maxValue])
                .range(this.range());
        } else {
            return d3.scale.ordinal()
                .domain(this.labels())
                .rangeBands(this.range());
        }
    }
});

chorus.views.visualizations.XAxis = chorus.views.visualizations.Axis.extend({
    requiredBottomSpace: function() {
        var self = this
        this.el = this.container.append("svg:g").attr("class", "xaxis");
        var testTickLabels = this.el.selectAll(".label")
            .data(this.labels()).enter()
            .append("svg:g")
            .attr("class", "label")
            .append("svg:text")
            .text(function(d) {
                return self.labelFormat(d, 4)
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

    range: function() {
        return [this.minX(), this.maxX()];
    },

    rotateTickLabelsIfNeeded: function() {
        var bandWidth = (this.maxX() - this.minX()) / this.labels().length;
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
        var tickScale = this.tickScale();

        var self = this;
        this.el = this.container.append("svg:g").attr("class", "xaxis");

        // draw axis label
        var axisLabel = this.el.append("svg:text")
            .text(this.axisLabel)
            .attr("x", 0)
            .attr("y", this.maxY())
            .attr("class", "axis_label")

        // reposition axis label now that we know its width
        var axisLabelWidth = axisLabel[0][0].getBBox().width
        var centerX = (this.minX() + this.maxX()) / 2 - axisLabelWidth / 2;
        this.el.select(".axis_label").attr("x", centerX)

        // draw tick labels
        var tickLabelBottom = this.maxY() - this.labelSpacing - this.axisLabelHeight();
        var tickLabels = this.el.append("svg:g").attr("class", "labels")
            .selectAll(".label")
            .data(this.labels()).enter()
            .append("svg:g")
            .attr("class", "label")
            .append("svg:text")
            .attr("y", tickLabelBottom)
            .attr("x", 0)
            .text(function(d) {
                return self.labelFormat(d, 4)
            });

        // reposition labels now that we know their width
        tickLabels
            .attr("x", function(d) {
                var left = tickScale(d);
                var width = this.getBBox().width;
                return left - (width / 2);
            });

        this.rotateTickLabelsIfNeeded();

        var tickBottom = tickLabelBottom - this.tickLabelHeight() - this.labelSpacing;
        var tickTop    = tickBottom - this.tickLength;

        // draw ticks
        this.el.append("svg:g").attr("class", "ticks").selectAll(".tick")
            .data(this.labels()).enter()
            .append("svg:line")
            .attr("class", "tick")
            .attr("y1", tickTop)
            .attr("y2", tickBottom)
            .attr("x1", tickScale)
            .attr("x2", tickScale)

        // draw grid lines if applicable
        if(this.hasGrids) {
            this.el.append("svg:g").attr("class", "grids").selectAll(".grid")
                .data(this.labels().slice(1)).enter()
                .append("svg:line")
                .attr("class", "grid")
                .attr("y1", this.minY())
                .attr("y2", tickTop)
                .attr("x1", tickScale)
                .attr("x2", tickScale)
        }

        // draw main axis line
        this.el.append("svg:line")
            .attr("class", "axis")
            .attr("x1", this.minX())
            .attr("x2", this.maxX())
            .attr("y1", tickTop)
            .attr("y2", tickTop);
    }
});

chorus.views.visualizations.YAxis = chorus.views.visualizations.Axis.extend({
    requiredLeftSpace: function() {
        this.el = this.container.append("svg:g").attr("class", "yaxis");
        var self = this;
        this.el.selectAll(".label.test-origin-y")
            .data(this.labels()).enter()
            .append("svg:g")
            .attr("class", "label")
            .append("svg:text")
            .text(function(d) {
                return self.labelFormat(d, 4)
            });
        var testAxisLabel = this.el.append("svg:g")
            .attr("class", "axis_label")
            .append("svg:text")
            .attr("x", 0)
            .attr("y", 0)
            .text(this.axisLabel)

        var axisLabelHeight  = testAxisLabel[0][0].getBBox().height;
        var width = axisLabelHeight + this.labelWidth() + 2*this.labelSpacing + this.tickLength;

        this.el.remove();
        return width;
    },

    labelWidth: function() {
        return _.max(_.map(this.el.selectAll(".label")[0], function(label) {
            return label.getBBox().width
        }))
    },

    range: function() {
        return [this.maxY(), this.minY()];
    },

    render : function() {
        var self = this;
        this.el = this.container.append("svg:g").attr("class", "yaxis");

        var scale = this.scale();
        var tickScale = this.tickScale();

        // draw axis label
        var axisLabelContainer = this.el.append("svg:g")
            .attr("class", "axis_label")
        var axisLabel = axisLabelContainer.append("svg:text")
            .attr("x", 0)
            .attr("y", 0)
            .text(this.axisLabel)

        // reposition axis label now that we know its height
        var centerY = (this.minY() + this.maxY()) / 2
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
            .data(this.labels()).enter()
            .append("svg:text")
            .attr("class", "label")
            .attr("y", 0)
            .attr("x", 0)
            .text(function(d) {
                return self.labelFormat(d, 4)
            }).attr("title", function(d){return d;});

        // reposition labels now that we know their width
        this.el.selectAll(".label")
            .attr("x", tickLabelLeft)
            .attr("y", function(d) {
                var scalePoint = tickScale(d);
                var height = this.getBBox().height;
                return scalePoint + (height / 4);
            });

        var tickLeft  = tickLabelLeft + this.labelWidth() + this.labelSpacing;
        var tickRight = tickLeft + this.tickLength;

        // draw ticks
        this.el.selectAll(".tick")
            .data(this.labels()).enter()
            .append("svg:line")
            .attr("class", "tick")
            .attr("y1", tickScale)
            .attr("y2", tickScale)
            .attr("x1", tickLeft)
            .attr("x2", tickRight);

        // draw grid lines if applicable
        if(this.hasGrids) {
            this.el.append("svg:g").attr("class", "grids").selectAll(".grid")
                .data(this.labels()).enter()
                .append("svg:line")
                .attr("class", "grid")
                .attr("y1", tickScale)
                .attr("y2", tickScale)
                .attr("x1", tickRight)
                .attr("x2", this.maxX())
        }

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
    this.xAxis = new chorus.views.visualizations.XAxis({
        el: options.el,
        minValue: options.minXValue,
        maxValue: options.maxXValue,
        scaleType: options.xScaleType,
        labels: options.xLabels,
        axisLabel: options.xAxisLabel,
        hasGrids: options.hasXGrids
    });

    this.yAxis = new chorus.views.visualizations.YAxis({
        el: options.el,
        minValue: options.minYValue,
        maxValue: options.maxYValue,
        scaleType: options.yScaleType,
        labels: options.yLabels,
        axisLabel: options.yAxisLabel,
        hasGrids: options.hasYGrids
    });
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
