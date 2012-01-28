chorus.views.BreadcrumbsView = chorus.views.Base.extend({
    className:"breadcrumbs",
    context:function () {
        return this.options;
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