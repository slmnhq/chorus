chorus.models.BoxplotTask = chorus.models.Base.extend({
    urlTemplate: "task/sync/",

    initialize: function() {
        this.set({ "chart[type]": "boxplot" });
    },

    beforeSave: function() {
        this.set({ relation: "SELECT * FROM " + this.get("objectName") });
    }
});
