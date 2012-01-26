;(function(ns) {
    ns.presenters.visualizations = {};

    ns.presenters.visualizations.XY = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.XY.prototype, {
        present: function() {
            var x = this.options.x;
            var y = this.options.y;
            return _.map(this.task.get("result").rows, function(row) {
                return [row[x], row[y]];
            });
        }
    });

    ns.presenters.visualizations.Boxplot = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.Boxplot.prototype, {
        present: function() {
            var y = this.options.y;

            var groups = _.groupBy(this.task.get("result").rows, this.options.x);
            return _.map(groups, function(rows, keyName){
                var values = _.pluck(rows, y);
                var min = _.min(values);
                var max = _.max(values);
                var quartiles = jStat.quartiles(values);

                return [keyName, min, quartiles[0], quartiles[2], max];
            })
        }
    });
})(chorus);
