chorus.views.SearchTabularDataList = chorus.views.Base.extend({
    className: "search_tabular_data_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.collection.attributes.total,
            moreResults: (this.collection.length < this.collection.attributes.total)
        }
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl()
        }
    },

    postRender: function() {
        var lis = this.$("li");

        _.each(this.collection.models, function(model, index) {
            var $li = lis.eq(index);
            $li.find("a.instance, a.database").data("instance", model.get("instance"));
        });
    }
});