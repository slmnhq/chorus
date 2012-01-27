(function($, ns) {
    ns.views.DatasetList = chorus.views.Base.extend({
        tagName : "ul",
        className : "dataset_list",
        additionalClass : "list",
        events : {
            "click li" : "selectDataset"
        },

        postRender : function() {
            var lis = this.$("li");

            _.each(this.collection.models, function(model, index) {
                lis.eq(index).data("dataset", model);
            });

            lis.eq(0).click();
        },

        collectionModelContext : function(model) {
            return {
                iconImgUrl : model.iconUrl(),
                showUrl : model.showUrl()
            }
        },

        selectDataset : function(e) {
            this.$("li").removeClass("selected");
            var selectedDataset = $(e.target).closest("li");
            selectedDataset.addClass("selected");
            this.trigger("dataset:selected", selectedDataset.data("dataset"));
        }
    });
})(jQuery, chorus);