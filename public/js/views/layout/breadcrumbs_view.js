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

    ns.WorkspaceBreadcrumbsView = ns.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs : function(){
            return [
                    {label: t("breadcrumbs.home"), url: "#/"},
                    {label: t("breadcrumbs.workspaces"), url: "#/workspaces"},
                    {label: this.model.get("name")}
                ];
        }
    });

    ns.UserShowBreadcrumbView = ns.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs : function() {
            return [
                { label: t("breadcrumbs.home"), url: "#/" },
                { label: t("breadcrumbs.users"), url: "#/users" },
                { label: this.model.displayShortName(20) }
            ];
        }
    });

})(jQuery, chorus.views);
