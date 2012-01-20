;(function(ns){
    ns.views.TaskDataTable = ns.views.Base.extend({
        className: "data_table",

        events : {
            "click a.move_to_first" : "moveColumnToFirst"
        },

        // backbone events don't work for scroll?!
        postRender: function() {
            this.$(".tbody").bind("scroll", _.bind(this.adjustHeaderPosition, this));
        },

        additionalContext : function() {
            return { columns: this.model.columnOrientedData() };
        },

        adjustHeaderPosition: function() {
            this.$(".thead").css({ "left": -this.$(".tbody").scrollLeft() });
        },

        moveColumnToFirst : function(e) {
            e.preventDefault();

            var $th = $(e.currentTarget).closest(".th");
            var $thead = this.$(".thead");
            var $tbody = this.$(".tbody");
            var index = $thead.find(".th").index($th);

            $thead.prepend($th);
            $tbody.prepend(this.$(".column").eq(index));
        }
    });
})(chorus);
