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

        selectColumn : function(e) {
            this.$("li").removeClass("selected");
            var selectedColumn = $(e.target).closest("li");
            selectedColumn.addClass("selected");
        }
    });
})(jQuery, chorus);