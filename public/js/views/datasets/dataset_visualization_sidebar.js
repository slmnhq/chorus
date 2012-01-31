chorus.views.DatasetVisualizationSidebar = chorus.views.Sidebar.extend({
    className:"dataset_visualization_sidebar",

    setup: function() {

    },

    postRender : function() {
        chorus.styleSelect(this.$('select'));
    }
});