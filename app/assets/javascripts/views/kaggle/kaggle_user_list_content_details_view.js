chorus.views.KaggleUserListContentDetails = chorus.views.Base.extend({
    constructorName: "KaggleUserListContentDetailsView",
    templateName: "kaggle_user_list_content_details",

    events: {
        "click button.search_kaggle_user": "submitSearch"
    },

    subviews: {
        '.filter_wizard': 'filterWizardView'
    },

    setup: function() {
        this._super("setup", arguments)
        this.filterWizardView = new chorus.views.KaggleFilterWizard();
    },

    postRender: function() {
        this.$(".count").text(t("entity.name.User", {count: this.collection.count()}));
    },

    submitSearch: function() {
        var paramArray = this.filterWizardView.collection.map(_.bind(function(model) {
            return encodeURIComponent(this.convertKey(model.get("column").get("name"))) + "|" +
                encodeURIComponent(model.get("comparator")) + "|" + encodeURIComponent((model.get("input").value));
        }, this));
        this.collection.urlParams = {'kaggleUser[]': paramArray};
        this.collection.fetch();
    },

    convertKey: function(key) {
        return key.replace(/ /g, "_").toLowerCase();
    }
});