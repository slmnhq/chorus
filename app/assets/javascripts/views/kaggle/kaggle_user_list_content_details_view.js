chorus.views.KaggleUserListContentDetails = chorus.views.Base.extend({
    constructorName: "KaggleUserListContentDetailsView",
    templateName: "kaggle_user_list_content_details",

    subviews: {
        '.filter_wizard': 'filterWizardView'
    },

    setup: function() {
        this._super("setup", arguments);
        this.filterWizardView = new chorus.views.KaggleFilterWizard();
    },

    postRender: function() {
        this.$(".count").text(t("entity.name.User", {count: this.collection.count()}));
    }
});