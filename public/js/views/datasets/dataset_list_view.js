(function($, ns) {
    ns.views.DatasetList = chorus.views.Base.extend({
        tagName : "ul",
        className : "dataset_list",
        additionalClass : "list",
        events : {
            "click li" : "selectDataset"
        },

        iconFor: function(model) {
            var type = model.get("type");

            if (type == 'CHORUS_VIEW') {
                return "/images/view_large.png";
            } else if (type == "SOURCE_TABLE") {
                return "/images/source_large.png";
            } else if (type == "SANDBOX_TABLE") {
                return "/images/table_large.png"
            } else {
                return "/images/table_large.png"
            }
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
                iconImgUrl : this.iconFor(model)
            }
        },

        selectDataset : function(e) {
            e.preventDefault();
            this.$("li").removeClass("selected");
            var selectedDataset = $(e.target).closest("li");
            selectedDataset.addClass("selected");
            this.trigger("dataset:selected", selectedDataset.data("dataset"));
        }
    });
})(jQuery, chorus);