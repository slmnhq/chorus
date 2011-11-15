; (function($, ns) {
    ns.BreadcrumbsView = chorus.views.Base.extend({
        className : "breadcrumbs",
        tagName : "ol",
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

    ns.WorkspaceBreadcrumbsView = ns.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs : function(){
            return [
                    {label: t("breadcrumbs.home"), url: "/"},
                    {label: this.model.get("name")}
                ];
        }
    });
})(jQuery, chorus.views);