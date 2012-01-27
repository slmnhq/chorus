(function($, ns) {
    ns.views.DatabaseColumnList = chorus.views.Base.extend({
        tagName : "ul",
        className : "database_column_list",
        additionalClass : "list",
        events : {
            "click li" : "selectColumn"
        },

        postRender : function() {
            this.$("li:eq(0)").click();
        },

        collectionModelContext : function(model) {
            return {
                typeClass : model.humanType(),
                typeString : t("data_types." + model.humanType())
            }
        },

        selectColumn : function(e) {
            this.$("li").removeClass("selected");
            var selectedColumn = $(e.target).closest("li");
            selectedColumn.addClass("selected");
        }
    });
})(jQuery, chorus);