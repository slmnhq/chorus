chorus.views.DatasetFilterWizard = chorus.views.Base.extend({
    className: "dataset_filter_wizard",
    events : {
        "click .add_filter" : "addFilter"
    },

    postRender : function() {
        if (!this.$(".filters li").length) {
            this.addFilter();
        }
    },

    addFilter : function(e) {
        e && e.preventDefault();
        var $li = $('<li class="filter"/>');
        var filterView = new chorus.views.DatasetFilter({collection: this.collection});
        filterView.el = $li[0];
        filterView.render();

        this.$(".filters").append(filterView.el);
    }
});