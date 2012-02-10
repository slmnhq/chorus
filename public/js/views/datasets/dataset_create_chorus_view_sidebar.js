chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    postRender : function() {
        this.$("a.preview").data("filters", this.filters);
        this.bind("column:selected", this.addColumn, this);
    },
    
    addColumn: function(model) {
        this.$(".non_empty_selection").removeClass("hidden");
        this.$(".empty_selection").addClass("hidden");
        this.$(".non_empty_selection .columns").append("<li>" + model.get("name") + "</li>");
    }
});