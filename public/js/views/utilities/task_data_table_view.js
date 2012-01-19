;(function(ns){
    ns.views.TaskDataTable = ns.views.Base.extend({
        className: "data_table",

        // backbone events don't work for scroll?!
        postRender: function() {
            this.$(".tbody").bind("scroll", _.bind(this.adjustHeaderPosition, this));
        },

        additionalContext : function() {
            return { columns: this.model.columnOrientedData() };
        },

        adjustHeaderPosition: function() {
            this.$(".thead").css({ "left": -this.$(".tbody").scrollLeft() });
        }
    });
})(chorus);
