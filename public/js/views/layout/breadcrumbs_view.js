chorus.views.BreadcrumbsView = chorus.views.Base.extend({
    className:"breadcrumbs",
    context: function () {
        return this.options;
    },

    postRender: function() {
        var $crumb = this.$(".breadcrumb");
        _.each(this.context().breadcrumbs, function(breadcrumb, index){
            if (breadcrumb.data) {
                $crumb.eq(index).find('a').data(breadcrumb.data);
            }
        });
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