;(function(ns) {
    ns.presenters.visualizations = {};

    ns.presenters.visualizations.XY = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.XY.prototype, {
        present: function() {
            var rows = this.task.get("result").rows;
            var xs = _.pluck(rows, this.options.x);
            var ys = _.pluck(rows, this.options.y);
            var data = _.map(rows, function(_row, i) {
                return { x: xs[i], y: ys[i] };
            });

            return _.extend(data, {
                maxX : _.max(xs),
                maxY : _.max(ys),
                minX : _.min(xs),
                minY : _.min(ys)
            });
        }
    });

    ns.presenters.visualizations.Frequency = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.Frequency.prototype, {
        present: function() {
            var groups = _.groupBy(this.task.get("result").rows, this.options.column);
            var groupLengths = {};
            _.each(groups, function(val, groupName) {
                groupLengths[groupName] = val.length;
            });
            return { frequencies : groupLengths };
        }
    });

    ns.presenters.visualizations.Boxplot = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.Boxplot.prototype, {
        present: function() {
            var boxes = _.map(this.task.get("result").rows, function(row) {
                return {
                    min:           row.min,
                    median:        row.median,
                    bucket:        row.bucket,
                    max:           row.max,
                    firstQuartile: row.firstQuartile,
                    thirdQuartile: row.thirdQuartile
                };
            });

            boxes.minY = _.min(_.pluck(boxes, "min"));
            boxes.maxY = _.max(_.pluck(boxes, "max"));

            return boxes;
        }
    });

    chorus.presenters.visualizations.Histogram = function(task, options) {
        this.task = task;
        this.options = options;
    }

    _.extend(chorus.presenters.visualizations.Histogram.prototype, {
        present: function() {
            return _.map(this.task.get("rows"), function(row) {
                return {x: row.bin, y: row.frequency};
            });
        }
    });


})(chorus);
