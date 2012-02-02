(function(chorus) {
    chorus.views.visualizations.Axis = function(chart, options) {
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

            var labels = axisGroup
                .append("svg:g")
                .attr("class", "labels")
                .selectAll("text")
                .data(this.labels)
                .enter().append("svg:text")
                .attr("x", attrs.x)
                .attr("y", attrs.y)
                .attr("dx", attrs.dxLabel)
                .attr("dy", attrs.dyLabel)
                .text(function(d) {
                    return d.label
                })

            if(options.center_horizontal){
                labels.attr("dx", function(){return -0.5*this.getBoundingClientRect().width;})
            }
            if(options.center_vertical){
                labels.attr("dy", function(){return 0.25*this.getBoundingClientRect().height;})
            }

            axisGroup
                .append("svg:g")
                .attr("class", "axis_edge")
                .append("svg:line");

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
            var isRendered = title[0][0].getBoundingClientRect().bottom
            var box = isRendered ? title[0][0].getBBox(): {y : 0};
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
            var axis_edge = self.gfx.select("g.axis_edge").selectAll("line");

            texts
                .attr("x", scale.rangeBand ? function(d) {
                return scale(d.locator) + scale.rangeBand() / 2
            } : function(d) {
                return scale(d.locator)
            });


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

            var xleft = chart.scales.x.range()[0];
            var xright = chart.scales.x.range()[chart.scales.x.range().length-1]+ chart.scales.x.rangeBand();
            if( options.axis_edge) {
            axis_edge
                .attr("x1", xleft)
                .attr("x2", xright)
                .attr("y1", chart.scales.y.range()[0])
                .attr("y2", chart.scales.y.range()[0]);
            } else {
                axis_edge.remove();
            }



            if (options.ticks) {
                var bandedOffset = chart.scales.y.rangeBand ? chart.scales.y.rangeBand() : 0;

                ticks
                    .attr("x1", function(d) {
                    return scale(d.locator)
                })
                    .attr("x2", function(d) {
                        return scale(d.locator)
                    })
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
            var axis_edge = self.gfx.select("g.axis_edge").selectAll("line");


            group
                .attr("height", height)

            texts
                .attr("y", scale.rangeBand ? function(d) {
                return scale(d.locator) + scale.rangeBand() / 2
            } : function(d) {
                return scale(d.locator)
            });

            axis_edge
                .attr("x1", chart.scales.x.range()[0])
                .attr("x2", chart.scales.x.range()[0])
                .attr("y1", chart.scales.y.range()[0])
                .attr("y2", chart.scales.y.range()[1]);


            if (options.ticks) {
                var lastXVal = chart.scales.x.range()[chart.scales.x.range().length - 1];
                if (chart.scales.x.rangeBand) lastXVal += chart.scales.x.rangeBand();
                ticks
                    .attr("y1", function(d) {
                    return scale(d.locator)
                })
                    .attr("y2", function(d) {
                        return scale(d.locator)
                    })
                    .attr("x1", chart.scales.x.range()[0])
                    .attr("x2", lastXVal);
            }
        }

        this.chart = chart;
        this.options = options;
    };

    chorus.views.visualizations.Layout = function(chart) {
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
    };

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

            var isRendered = svg.getBoundingClientRect().bottom;
                        
            return isRendered ? svg.getBBox(): { x: 0, y : 0, width : 0, height : 0 };
        }

        return { x: 0, y : 0, width : 0, height : 0 };
    }
})(chorus);
