; (function($, ns) {
    ns.BreadcrumbsView = chorus.views.Base.extend({
        className : "breadcrumbs",
        context : function(){
            return this.options;
        }
    });

    ns.ModelBoundBreadcrumbsView = ns.BreadcrumbsView.extend({
        getLoadedCrumbs : function() {
            return [];
        },
        getLoadingCrumbs : function() {
            return []
        },
        context : function() {
            return { breadcrumbs : this.model.loaded ? this.getLoadedCrumbs() : this.getLoadingCrumbs() };
        }
    });

})(jQuery, chorus.views);
