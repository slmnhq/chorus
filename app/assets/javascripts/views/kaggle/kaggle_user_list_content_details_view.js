chorus.views.KaggleUserListContentDetails = chorus.views.Base.extend({
    constructorName: "KaggleUserListContentDetailsView",
    templateName:"kaggle_user_list_content_details",

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
        var params = this.filterWizardView.collection.map(function(model) {
            return encodeURI(model.get("column").get("name")) + "|" +
                encodeURI(model.get("comparator")) +"|" + encodeURI((model.get("input").value))
        });

        this.collection.urlParams = params;
        this.collection.fetch();
    }
});