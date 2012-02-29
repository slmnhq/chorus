chorus.views.BreadcrumbsView = chorus.views.Base.extend({
    constructorName: "BreadcrumbsView",
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
        var breadcrumbs;
        if(this.model && !this.model.loaded) {
            breadcrumbs = this.getLoadingCrumbs();
        } else {
            breadcrumbs = this.getLoadedCrumbs();
        }
        return { breadcrumbs: breadcrumbs };
    }
});