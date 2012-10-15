chorus.views.KaggleUserListContentDetails = chorus.views.Base.extend({
    constructorName: "KaggleUserListContentDetailsView",
    templateName:"kaggle_user_list_content_details",

    subviews: {
        '.filter_wizard': 'filterWizardView'
    },

    setup: function() {
        this.filterWizardView = new chorus.views.KaggleFilterWizard();
    }
});