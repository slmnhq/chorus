chorus.views.SearchDataset = chorus.views.SearchItemBase.extend({
    constructorName: "SearchDatasetView",
    className: "search_dataset",
    eventType: 'tabularData',

    additionalContext: function() {
        var context = {
            dataset: this.model.asDataset(),
            showUrl: this.model.showUrl(),
            iconUrl: this.model.iconUrl()
        };

        var workspaces;
        if (this.model.get("workspaces")) {
            context.workspaces = this.model.get("workspaces");
        } else if (this.model.get("workspace")) {
            context.workspaces = [this.model.get("workspace")];
        }

        return context;
    },

    postRender: function() {
        this._super("postRender");

        this.$("a.instance, a.database").data("instance", this.model.get("instance"));
        chorus.menu(this.$(".location .found_in a.open_other_menu"), {
            content: this.$(".other_menu")
        });
    }
});
