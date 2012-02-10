chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    postRender : function() {
        this.$("a.preview").data("filters", this.filters);
    }
});