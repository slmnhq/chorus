chorus.models.Task = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
    urlTemplate: "task/sync/",

    initialize: function(attrs) {
        this.set({ taskType: this.taskType });
    }
}));
