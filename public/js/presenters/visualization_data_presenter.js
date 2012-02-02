;(function(ns) {
    ns.presenters.visualizations = {};

    ns.presenters.visualizations.Timeseries = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.Timeseries.prototype, {
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
            var frequencies = {};
            _.each(this.task.get("result").rows, function(row) {
                frequencies[row.bucket] = row.count;
            });
            return { frequencies : frequencies };
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
                    thirdQuartile: row.thirdQuartile,
                    percentage:    row.percentage
                };
            });

            var orderedBoxes = _.sortBy(boxes, function(box) {
                return -1 * parseInt(box.percentage);
            });

            orderedBoxes.minY = _.min(_.pluck(orderedBoxes, "min"));
            orderedBoxes.maxY = _.max(_.pluck(orderedBoxes, "max"));

            return orderedBoxes;
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
