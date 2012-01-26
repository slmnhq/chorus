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
})(chorus);
