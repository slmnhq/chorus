/*
 * Copyright (c) 2011 EMC Corporation All Rights Reserved
 *
 * This software is protected, without limitation, by copyright law
 * and international treaties. Use of this software and the intellectual
 * property contained therein is expressly limited to the terms and
 * conditions of the License Agreement under which it is provided by
 * or on behalf of EMC.
 */

(function(d3) {
    chorus = window.chorus || {};
    chorus.chart = {};

    chorus.chart.boxplot = function(canvas, data, config) {
        var chart = new Boxplot(canvas, data, config);
        chart.layout.render();

        canvas.attr('class', 'boxplot');
        var plot = canvas.append("svg:g")
            .attr("class", "plot")

        function quartileRectangles(plot) {
            plot
                .selectAll("rect")
                .data(data)
                .enter().append("svg:rect")
                .attr("x", function(d) {
                    return chart.scales.x(d.bucket)
                })
                .attr("width", function(d) {
                    return chart.scales.x.rangeBand()
                })
                .attr("y", function(d) {
                    return chart.scales.y(d.thirdQuartile)
                })
                .attr("height", function(d) {
                    return chart.scales.y(d.firstQuartile) - chart.scales.y(d.thirdQuartile)
                })

        }

        function midline(plot) {
            plot
                .selectAll("line.mid")
                .data(data)
                .enter().append("svg:line")
                .attr("class", "mid")
                .attr("x1", function(d) {
                    return chart.scales.x(d.bucket) + chart.scales.x.rangeBand() / 2
                })
                .attr("x2", function(d) {
                    return chart.scales.x(d.bucket) + chart.scales.x.rangeBand() / 2
                })
                .attr("y1", function(d) {
                    return chart.scales.y(d.max)
                })
                .attr("y2", function(d) {
                    return chart.scales.y(d.min)
                })

        }

        function medianline(plot) {
            plot
                .selectAll("line.median")
                .data(data)
                .enter().append("svg:line")
                .attr("class", "median")
                .attr("x1", function(d) {
                    return chart.scales.x(d.bucket)
                })
                .attr("x2", function(d) {
                    return chart.scales.x(d.bucket) + chart.scales.x.rangeBand()
                })
                .attr("y1", function(d) {
                    return chart.scales.y(d.median)
                })
                .attr("y2", function(d) {
                    return chart.scales.y(d.median)
                })

        }

        function whiskers(plot) {
            plot
                .selectAll("line.whisker-top")
                .data(data)
                .enter().append("svg:line")
                .attr("class", "whisker-top")
                .attr("x1", function(d) {
                    return chart.scales.x(d.bucket)
                })
                .attr("x2", function(d) {
                    return chart.scales.x(d.bucket) + chart.scales.x.rangeBand()
                })
                .attr("y1", function(d) {
                    return chart.scales.y(d.max)
                })
                .attr("y2", function(d) {
                    return chart.scales.y(d.max)
                })
            plot
                .selectAll("line.whisker-bottom")
                .data(data)
                .enter().append("svg:line")
                .attr("class", "whisker-bottom")
                .attr("x1", function(d) {
                    return chart.scales.x(d.bucket)
                })
                .attr("x2", function(d) {
                    return chart.scales.x(d.bucket) + chart.scales.x.rangeBand()
                })
                .attr("y1", function(d) {
                    return chart.scales.y(d.min)
                })
                .attr("y2", function(d) {
                    return chart.scales.y(d.min)
                })

        }

        quartileRectangles(plot);
        midline(plot);
        medianline(plot);
        whiskers(plot);
    };

    function Boxplot(canvas, data, config) {
        this.type = 'boxplot';
        this.canvas = canvas;
        this.data = data;

        var min = d3.min(_.map(data, function(d) {
            return d.min;
        }));
        var max = d3.max(_.map(data, function(d) {
            return d.max;
        }));

        var xLabels = _.map(data, function(d) {
            return {locator : d.bucket, label : d.bucket + " (" + d.percentage + ")"};
        });

        this.scales = {
            x : d3.scale.ordinal().domain(_.map(data, function(d) { return d.bucket })),
            y : d3.scale.linear().domain([min, max])
        };

        var yLabels = _.map(this.scales.y.ticks(8), function(d) {
            return {locator : d, label : d};
        });
        this.labels = {
            x : xLabels,
            y : yLabels
        };

        this.axes = {
            x : new Axis(this, { title : config.xAxisTitle || 'x axis', padding : 0, rangeType : 'rangeBands', from : "y", to : "right" }).south(),
            y : new Axis(this, { title : config.yAxisTitle || 'y axis', rangeType : 'range', ticks : true, from : "height", to : "top" }).west()
        }
        this.layout = new Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }

    chorus.chart.frequency = function(canvas, data, config) {
        var chart = new Frequency(canvas, data, config);
        chart.layout.render();

        canvas.attr('class', 'frequency');
        var plot = canvas.append("svg:g")
            .attr("class", "plot")
        plot
            .selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("x", chart.scales.x.range()[0])
            .attr("y", function(d) {
                return chart.scales.y(d.bucket);
            })
            .attr("height", chart.scales.y.rangeBand())
            .attr("width", function(d) {
                return chart.scales.x(d.count) - chart.scales.x(0);
            });
    };

    function Frequency(canvas, data, config) {
        this.type = 'frequency';
        this.canvas = canvas;
        this.data = data;

        var min = d3.min(_.map(data, function(d) {
            return d.count;
        }));
        var max = d3.max(_.map(data, function(d) {
            return d.count;
        }));

        var yLabels = _.map(data, function(d) {
            return {label : d.bucket, locator : d.bucket };
        });

        this.scales = {
            x : d3.scale.linear().domain([0, max]),
            y : d3.scale.ordinal().domain(_.map(yLabels, function(d) {return d.locator}))
        };

        var xLabels = _.map(this.scales.x.ticks(8), function(d) {
            return {label : d, locator : d };
        });

        this.labels = {
            x : xLabels,
            y : yLabels
        };

        this.axes = {
            x : new Axis(this, { title : config.xAxisTitle || 'count', padding : 0, rangeType : 'range', ticks: true, from : "y", to : "right" }).north(),
            y : new Axis(this, { title : config.yAxisTitle || 'y axis', rangeType : 'rangeBands', from : "top", to : "height" }).west()
        }
        this.layout = new Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }

    chorus.chart.histogram = function(canvas, data, config) {
        var chart = new Histogram(canvas, data, config);
        chart.layout.render();

        canvas.attr('class', 'histogram');
        var plot = canvas.append("svg:g")
            .attr("class", "plot")
        plot
            .selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return chart.scales.x(d.bin)
            })
            .attr("width", chart.scales.x.rangeBand)
            .attr("y", function(d) {
                return chart.scales.y(d.frequency)
            })
            .attr("height", function(d) {
                return chart.scales.y(0) - chart.scales.y(d.frequency)
            })
    };

    function Histogram(canvas, data, config) {
        this.type = 'histogram';
        this.canvas = canvas;
        this.data = data;

        var max = d3.max(_.map(data, function(d) {
            return d.frequency;
        }));

        var xLabels = _.map(data, function(d) {
            return {label : d.bin, locator : d.bin};
        });

        this.scales = {
            x : d3.scale.ordinal().domain(_.map(xLabels, function(d) {return d.locator})),
            y : d3.scale.linear().domain([0, max])
        };

        var yLabels = _.map(this.scales.y.ticks(8), function(d) {
            return {label : d, locator : d};
        });

        this.labels = {
            x : xLabels,
            y : yLabels
        };
        this.axes = {
            x : new Axis(this, { title : config.yAxisTitle || 'x axis', padding : 0, rangeType : 'rangeBands', from : "y", to : "right" }).south(),
            y : new Axis(this, { title : config.xAxisTitle || 'count', rangeType : 'range', ticks: true, from : "height", to : "top" }).west()
        }
        this.layout = new Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }


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
            x : new Axis(this, { title : config.xAxisTitle || 'x axis', padding : 0, rangeType : 'rangeBands', from : "y", to : "right" }).south(),
            y : new Axis(this, { title : config.yAxisTitle || 'y axis', rangeType : 'rangeBands', from : "height", to : "top" }).west()
        }

        this.layout = new Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });

    }

    chorus.chart.timeseries = function(canvas, data, config) {
        var chart = new Timeseries(canvas, data, config);
        chart.layout.render();

        var line = d3.svg.line()
            .x(function(d) {
                return chart.scales.x(d.time);
            })
            .y(function(d) {
                return chart.scales.y(d.value);
            });

        chart.canvas.append("svg:path")
            .attr("class", "series")
            .attr("d", line(data));
    };

    function Timeseries(canvas, data, config) {
        var bounds = {
            min : d3.min(_.map(data, function(d) {
                return d.value;
            })),
            max : d3.max(_.map(data, function(d) {
                return d.value;
            }))
        };

        this.type = 'timeseries';
        this.canvas = canvas;
        this.data = data;
        var xLabels = _.map(data, function(d) {
            return {label : d.time, locator : d.time};
        });
        this.scales = {
            x : d3.scale.ordinal().domain(_.map(xLabels, function(d){ return d.locator})),
            y : d3.scale.linear().domain([bounds.min, bounds.max])
        };
        var yLabels = _.map(this.scales.y.ticks(8), function(d) {
            return {label : d, locator : d};
        });
        this.labels = {
            x : xLabels,
            y : yLabels
        };
        this.axes = {
            x : new Axis(this, { title : config.xAxisTitle || 'x axis', anchor : 'origin', padding : 0.5, rangeType : 'rangePoints', from : "y", to : "right" }).south(),
            y : new Axis(this, { title : config.yAxisTitle || 'y axis', ticks : true, rangeType : 'range', from : "height", to : "top" }).west()
        }
        this.layout = new Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }

    function Axis(chart, options) {
        var self = this;
        var rotation = 45;
        var canvas = chart.canvas;

        this.render = function render() { // private
            attrs = this.renderOptions;

            var axisGroup = canvas
                .append("svg:g")
                .attr("class", "axis " + self.orientation);

            axisGroup
                .append("svg:g")
                .attr("class", "title")
                .append("svg:text")
                .attr("x", attrs.x)
                .attr("y", attrs.y)
                .attr("dy", attrs.dyTitle)
                .text(options.title);

            axisGroup
                .append("svg:g")
                .attr("class", "labels")
                .selectAll("text")
                .data(this.labels)
                .enter().append("svg:text")
                .attr("x", attrs.x)
                .attr("y", attrs.y)
                .attr("dx", attrs.dxLabel)
                .attr("dy", attrs.dyLabel)
                .text(function(d) {return d.label});

            axisGroup
                .append("svg:g")
                .attr("class", "grid")
                .selectAll("line")
                .data(this.labels)
                .enter().append("svg:line");

            this.gfx = axisGroup;
            if (this.rotation) rotateTitle(this.rotation);
            return this;
        }

        function rotateTitle(deg) { // private
            var title = self.gfx.select("g.title");
            var box = title[0][0].getBBox();
            var rotx = 0;
            var roty = box.y;

            title.attr("transform", "rotate(" + deg + ", " + rotx + ", " + roty + ")");
        }

        this.north = function north() {
            self.orientation = "north";

            this.layout = layoutX;
            this.labels = chart.labels.x;
            this.renderOptions = { x : '50%', y : 0, dyTitle : '1em', dxLabel : 0, dyLabel : '2.5em' };
            return this;
        }

        this.south = function south() {
            self.orientation = "south";

            this.layout = layoutX;
            this.labels = chart.labels.x;
            this.renderOptions = { x : '50%', y : '100%', dyTitle : '-0.5em', dxLabel : 0, dyLabel : '-2em' };
            return this;
        }

        this.east = function east() {
            self.orientation = "east";

            this.layout = layoutY;
            this.labels = chart.labels.y;
            this.rotation = 90;
            this.renderOptions = { x : '100%', y : '50%', dyTitle : '1em', dxLabel : "-2em", dyLabel : 0 };
            return this;
        }

        this.west = function west() {
            self.orientation = "west";

            this.layout = layoutY;
            this.labels = chart.labels.y;
            this.rotation = 270;
            this.renderOptions = { x : 0, y : '50%', dyTitle : '1em', dxLabel : "2em", dyLabel : 0 };
            return this;
        }

        function layoutX(dim, scale) {
            var labels = chart.labels.x;
            var width = dim.width;
            var columnWidth = width / labels.length;
            var group = self.gfx.select("g.labels");
            var texts = group.selectAll("text");
            var maxLabel = maxWidth(texts[0]);
            var rotate = (maxLabel > columnWidth);
            var ticks = self.gfx.select("g.grid").selectAll("line");

            texts
                .attr("x", scale.rangeBand ? function(d) {
                return scale(d.locator) + scale.rangeBand() / 2
            } : function(d) { return scale(d.locator)});


            if (rotate) {
                var height = (Math.sin(rotation * (Math.PI / 180)) * maxLabel);

                texts
                    .attr("transform", function(d, i) {
                    var box = dimensions(this);
                    var translateX = (box.width / 2);
                    var rotateX = box.x + translateX;
                    var rotateY = box.y - height;

                    if (self.orientation === "north") {
                        return "rotate(" + (360 - rotation) + ", " + rotateX + ", " + rotateY + ") translate(" + translateX + ", " + height + ")";
                    }
                    else {
                        return "rotate(" + (360 - rotation) + ", " + rotateX + ", " + rotateY + ") translate(" + (- translateX) + ", " + (- height) + ")";
                    }
                });
            }


            if (options.ticks) {
                var bandedOffset = chart.scales.y.rangeBand ? chart.scales.y.rangeBand() : 0;

                ticks
                    .attr("x1", function(d) { return scale(d.locator)})
                    .attr("x2", function(d) { return scale(d.locator)})
                    .attr("y1", chart.scales.y.range()[0])
                    .attr("y2", chart.scales.y.range()[chart.scales.y.range().length - 1] + bandedOffset);
            } else {
                ticks.remove();
            }
        }

        function layoutY(dim, scale) {
            var labels = chart.labels.y;
            var height = dim.height;
            var group = self.gfx.select("g.labels");
            var texts = group.selectAll("text");
            var ticks = self.gfx.select("g.grid").selectAll("line");

            group
                .attr("height", height)

            texts
                .attr("y", scale.rangeBand ? function(d) {
                return scale(d.locator) + scale.rangeBand() / 2
            } : function(d) { return scale(d.locator)});

            if (options.ticks) {
                var lastXVal = chart.scales.x.range()[chart.scales.x.range().length - 1];
                if (chart.scales.x.rangeBand) lastXVal += chart.scales.x.rangeBand();
                ticks
                    .attr("y1", function(d) { return scale(d.locator)})
                    .attr("y2", function(d) { return scale(d.locator)})
                    .attr("x1", chart.scales.x.range()[0])
                    .attr("x2", lastXVal);
            }
        }

        this.chart = chart;
        this.options = options;
    }

    function Layout(chart) {
        var canvas = chart.canvas;

        function plotRegion() {
            var pad = 20;
            var chartDim = {
                x : 0,
                y : 0,
                width  : canvas.attr("width"),  // NOTE: what do we do here for charts with flexible dimensions?
                height : canvas.attr("height")
            };

            var leftLabel = chart.canvas.select("g.axis.south .labels text:first-child, g.axis.north .labels text:first-child")[0];
            var leftLabelWidth = (dimensions(leftLabel).width / 1.4);
            if (chart.scales.x.rangeBand) {
                leftLabelWidth -= chart.scales.x.rangeBand() / 2
            }
            var northAxis = chart.canvas.select("g.axis.north")[0][0];
            var northAxisHeight = northAxis ? dimensions(northAxis).height : 0;
            var top = d3.max([northAxisHeight + 5, 15]);

            var x = dimensions(chart.axes.x.gfx).height + pad;
            var y = d3.max([dimensions(chart.axes.y.gfx).width + pad, leftLabelWidth]);
            var width = chartDim.width - y;
            var height = chartDim.height - x;

            return { x : x, y : y, width : width, height : height, right : canvas.attr("width") - 20, top : top  };
        }

        function setScale(axis, scale) {
            var plotDim = plotRegion();
            var rangeArray = [plotDim[axis.options.from], plotDim[axis.options.to]]
            scale[axis.options.rangeType](rangeArray, 0.1);
            axis.layout(plotDim, scale);
        }

        this.render = function() {
            chart.axes.x.render();
            chart.axes.y.render();
            setScale(chart.axes.x, chart.scales.x);
            setScale(chart.axes.y, chart.scales.y);
            setScale(chart.axes.x, chart.scales.x);
        }
    }

    function maxWidth(objects) {
        return d3.max(objects, function(object) {
            return dimensions(object).width;
        });
    }

    function dimensions(object) {
        // could be an array (of arrays) of svg
        var svg = object;

        if (svg) {
            while (! svg.nodeName) {
                svg = svg[0];
            }

            return svg.getBBox();
        }

        return { x: 0, y : 0, width : 0, height : 0 };
    }
})(d3);
