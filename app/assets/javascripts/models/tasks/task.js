chorus.models.Task = chorus.models.Base.include(
    chorus.Mixins.SQLResults
).extend({
    constructorName: "Task",

    urlTemplate: function(options) {
        if (options && options.method === "delete") {
            return this.urlTemplateBase + "/{{checkId}}"
        } else {
            return this.urlTemplateBase;
        }
    },

    initialize: function(attrs) {
        this.set({ checkId: Math.random().toString() + '_' + chorus.session.user().id });
    },

    cancel : function() {
        if (this._cancelInProgress || this.loaded) return;
        this._cancelInProgress = true;
        Backbone.sync('delete', this, {
            success: _.bind(function() {
                this.trigger("canceled");
                delete this._cancelInProgress;
            }, this)
        });
    }
});
