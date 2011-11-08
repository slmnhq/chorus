; (function($, ns) {
    ns.BreadcrumbsView = chorus.views.Base.extend({
        className : "breadcrumbs",
        tagName : "ol",
        context : function(){
            return this.options;
        }
    });
})(jQuery, chorus.views);