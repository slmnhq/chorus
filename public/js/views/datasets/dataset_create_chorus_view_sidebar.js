chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    postRender : function() {
        this.$("a.preview").data("filters", this.filters);
        this.bind("column:selected", this.addColumn, this);
        this.bind("column:deselected", this.removeColumn, this);
    },
    
    addColumn: function(model) {
        this.$(".non_empty_selection").removeClass("hidden");
        this.$(".empty_selection").addClass("hidden");
        
        var $li = $("<li>").attr("data-cid", model.cid).text(model.get("name") || "");
        this.$(".non_empty_selection .columns").append($li);
    },

    removeColumn: function(model) {
        if (!model) {
            return;
        }

        this.$("li[data-cid='" + model.cid + "']").remove();
        if (this.$(".columns li").length == 0) {
            this.$(".non_empty_selection").addClass("hidden");
            this.$(".empty_selection").removeClass("hidden");
        }
    }
});