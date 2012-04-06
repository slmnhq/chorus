chorus.models.Task = chorus.models.Base.include(
    chorus.Mixins.SQLResults
).extend({
    urlTemplate: "task/sync/",

    initialize: function(attrs) {
        this.set({
            taskType: attrs.taskType || this.taskType,
            checkId: Math.random().toString()
        });
    },

    cancel : function() {
        Backbone.sync('update', this, {
            data: {
                taskType: this.get('taskType'),
                checkId: this.get('checkId'),
                action: 'cancel'
            },
            success: _.bind(function() {
                this.trigger("canceled")
            }, this)
        });
    }
});
