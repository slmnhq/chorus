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
        var convertKey = this.convertKey;
        this.filterWizardView.collection.map(function(model) {
            paramArray.push(encodeURIComponent(convertKey(model.get("column").get("name"))) + "|" +
                encodeURIComponent(model.get("comparator")) +"|" + encodeURIComponent((model.get("input").value)))
        });
        this.collection.urlParams = {kaggleUser: JSON.stringify(paramArray)};
        this.collection.fetch();
    },

    convertKey: function(key) {

        return key.replace(/ /g, "_").toLowerCase();
    }
});