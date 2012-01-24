(function($, ns) {
    ns.views.DatasetList = chorus.views.Base.extend({
        tagName : "ul",
        className : "dataset_list",
        additionalClass : "list",

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

        collectionModelContext : function(model) {
            return {
                iconImgUrl : this.iconFor(model)
            }
        }
    });
})(jQuery, chorus);