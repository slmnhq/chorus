chorus.models.Task = chorus.models.Base.include(
    chorus.Mixins.SQLResults
).extend({
    urlTemplate: "task/sync/",

    initialize: function(attrs) {
        this.set({ taskType: this.taskType });
        this.set({ checkId: Math.random().toString() });
    },

    cancel : function() {
        Backbone.sync('update', this, {data: {
            taskType: this.get('taskType'),
            checkId: this.get('checkId'),
            action: 'cancel'
        }});
    }
});
