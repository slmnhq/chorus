chorus.views.BreadcrumbsView = chorus.views.Base.extend({
    className:"breadcrumbs",
    context: function () {
        return this.options;
    },

    postRender: function() {
        _.each(this.options.breadcrumbs, function(breadcrumb, index){
            if (breadcrumb.data) {
                this.$('.breadcrumb').eq(index).find('a').data(breadcrumb.data);
            }
        }, this);
    }
});

chorus.views.ModelBoundBreadcrumbsView = chorus.views.BreadcrumbsView.extend({
    getLoadedCrumbs:function () {
        return [];
    },
    getLoadingCrumbs:function () {
        return []
    },
    context:function () {
        return { breadcrumbs:this.model.loaded ? this.getLoadedCrumbs() : this.getLoadingCrumbs() };
    }
});