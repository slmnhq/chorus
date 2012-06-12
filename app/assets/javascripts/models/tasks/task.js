chorus.models.Task = chorus.models.Base.include(
    chorus.Mixins.SQLResults
).extend({
    constructorName: "Task",
    urlTemplate: "task/sync/",

    initialize: function(attrs) {
        this.set({
            taskType: attrs.taskType || this.taskType,
            checkId: Math.random().toString()
        });
    },

    cancel : function() {
        if (this.cancelled || this.loaded) return;
        this.cancelled = true;
        Backbone.sync('delete', this, {
            data: {
                taskType: this.get('taskType'),
                checkId: this.get('checkId')
            },
            success: _.bind(function() {
                this.trigger("canceled");
                delete this.cancelled;
            }, this)
        });
    }
});
