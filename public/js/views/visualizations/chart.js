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

        var boxWidth = chart.scales.x.rangeBand() * 0.2;
        var boxOffset = chart.scales.x.rangeBand() * 0.4;

        var boxes = plot.selectAll("g.box").data(data).enter().
            append("g").
            attr("class", "box");

        function quartileRectangles(boxes) {
            boxes.append("rect").
                attr("width", boxWidth).
                attr("height",
                function(d) {
                    return Math.abs(chart.scales.y(d.thirdQuartile) - chart.scales.y(d.firstQuartile))
                }).
                attr("x",
                function(d) {
                    return chart.scales.x(d.bucket) + boxOffset
                }).
                attr("y",
                function(d) {
                    return chart.scales.y(d.thirdQuartile)
                }).
                attr("bucket", function(d) {
                    return d.bucket
                });
        }

        function midline(boxes) {
            boxes
                .append("svg:line")
                .attr("class", "mid whisker")
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

        function medianline(boxes) {
            boxes
                .append("svg:line")
                .attr("class", "median")
                .attr("x1", function(d) {
                    return chart.scales.x(d.bucket) + boxOffset
                })
                .attr("x2", function(d) {
                    return chart.scales.x(d.bucket) + boxOffset + boxWidth
                })
                .attr("y1", function(d) {
                    return chart.scales.y(d.median)
                })
                .attr("y2", function(d) {
                    return chart.scales.y(d.median)
                })

        }

        function whiskers(boxes) {
            boxes
                .append("svg:line")
                .attr("class", "whisker top")
                .attr("x1", function(d) {
                    return chart.scales.x(d.bucket) + boxOffset + 0.25 * boxWidth

                })
                .attr("x2", function(d) {
                    return chart.scales.x(d.bucket) + boxOffset + 0.75 * boxWidth
                })
                .attr("y1", function(d) {

                    return chart.scales.y(d.max)
                })
                .attr("y2", function(d) {
                    return chart.scales.y(d.max)
                })
            boxes
                .append("svg:line")
                .attr("class", "whisker bottom")
                .attr("x1", function(d) {
                    return chart.scales.x(d.bucket) + boxOffset + 0.25 * boxWidth
                })
                .attr("x2", function(d) {
                    return chart.scales.x(d.bucket) + boxOffset + 0.75 * boxWidth
                })
                .attr("y1", function(d) {
                    return chart.scales.y(d.min)
                })
                .attr("y2", function(d) {
                    return chart.scales.y(d.min)
                })

        }

        midline(boxes);
        quartileRectangles(boxes);
        medianline(boxes);
        whiskers(boxes);

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
            x : d3.scale.ordinal().domain(_.map(data, function(d) {
                return d.bucket
            })),
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
            x : new chorus.views.visualizations.Axis(this, { title : config.xAxisTitle || 'x axis', padding : 0, rangeType : 'rangeBands', from : "y", to : "right", center_horizontal: true }).south(),
            y : new chorus.views.visualizations.Axis(this, { title : config.yAxisTitle || 'y axis', rangeType : 'range', ticks : true, from : "height", to : "top", center_vertical: true }).west()
        }
        this.layout = new chorus.views.visualizations.Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
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
            y : d3.scale.ordinal().domain(_.map(yLabels, function(d) {
                return d.locator
            }))
        };

        var xLabels = _.map(this.scales.x.ticks(8), function(d) {
            return {label : d, locator : d };
        });

        this.labels = {
            x : xLabels,
            y : yLabels
        };

        this.axes = {
            x : new chorus.views.visualizations.Axis(this, { title : config.xAxisTitle || 'count', padding : 0, rangeType : 'range', ticks: true, from : "y", to : "right" }).north(),
            y : new chorus.views.visualizations.Axis(this, { title : config.yAxisTitle || 'y axis', rangeType : 'rangeBands', from : "top", to : "height" }).west()
        }
        this.layout = new chorus.views.visualizations.Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }

    chorus.chart.histogram = function(canvas, data, config) {
        var chart = new Histogram(canvas, data, config);
        chart.layout.render();

        canvas.attr('class', 'histogram');
        var plot = canvas.append("svg:g")
            .attr("class", "plot")

        var barWidth = chart.scales.x.rangeBand() * 0.6;
        var barOffset = chart.scales.x.rangeBand() * 0.2;

        plot
            .selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return (chart.scales.x(d.bin) + barOffset)
            })
            .attr("width", barWidth)
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
            x : d3.scale.ordinal().domain(_.map(xLabels, function(d) {
                return d.locator
            })),
            y : d3.scale.linear().domain([0, max])
        };

        var yLabels = _.map(this.scales.y.ticks(6), function(d) {
            return {label : d, locator : d};
        });

        this.labels = {
            x : xLabels,
            y : yLabels
        };
        this.axes = {
            x : new chorus.views.visualizations.Axis(this, { title : config.xAxisTitle || 'x axis', padding : 0, rangeType : 'rangeBands', from : "y", to : "right", center_horizontal: true }).south(),
            y : new chorus.views.visualizations.Axis(this, { title : config.yAxisTitle || 'count', rangeType : 'range', ticks: true, axis_edge: true, from : "height", to : "top", center_vertical: true }).west()
        }
        this.layout = new chorus.views.visualizations.Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }


    chorus.chart.timeseries = function(canvas, data, config) {
        canvas.attr("class", "timeseries");
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
            x : d3.scale.ordinal().domain(_.map(xLabels, function(d) {
                return d.locator
            })),
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
            x : new chorus.views.visualizations.Axis(this, { title : config.xAxisTitle || 'x axis', anchor : 'origin', padding : 0.5, rangeType : 'rangePoints', from : "y", to : "right" }).south(),
            y : new chorus.views.visualizations.Axis(this, { title : config.yAxisTitle || 'y axis', ticks : true, rangeType : 'range', from : "height", to : "top" }).west()
        }
        this.layout = new chorus.views.visualizations.Layout(this, { xAxis : this.axes.x, yAxis : this.axes.y });
    }


})(d3);
