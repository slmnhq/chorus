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
        var paramArray =[]
        this.filterWizardView.collection.map(function(model) {
            paramArray.push(encodeURIComponent(model.get("column").get("name")) + "|" +
                encodeURIComponent(model.get("comparator")) +"|" + encodeURIComponent((model.get("input").value)))
        });
        //TODO pass the params as an array
        this.collection.urlParams = {kaggleUser: encodeURI(paramArray)};
        this.collection.fetch();
    }
});