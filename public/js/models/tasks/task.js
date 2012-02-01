chorus.models.Task = chorus.models.Base.extend({
    urlTemplate: "task/sync/",

    initialize: function(attrs) {
        this.set({ taskType: this.taskType });
    }
});
