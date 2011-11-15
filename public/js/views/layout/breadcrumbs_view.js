; (function($, ns) {
    ns.BreadcrumbsView = chorus.views.Base.extend({
        className : "breadcrumbs",
        tagName : "ol",
        context : function(){
            return this.options;
        }
    });

    ns.WorkspaceBreadcrumbsView = ns.BreadcrumbsView.extend({
        context : function() {
            if (this.model.loaded) {
                return { breadcrumbs : [
                    {label: t("breadcrumbs.home"), url: "/"},
                    {label: this.model.get("name")}
                ]};
            }

            return { breadcrumbs : [] }
        }
    });
})(jQuery, chorus.views);