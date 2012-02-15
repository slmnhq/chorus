chorus.models.Insight = chorus.models.Activity.extend({
    urlTemplate: "insight/",
    urlParams: function() {
        return {
            "workspaceId" : this.get("workspaceId")
        }
    },

    beforeSave: function(attrs) {
        this._super("beforeSave");
        this.set({
            'name': attrs.body,
            'text': attrs.body
        });
    }
});