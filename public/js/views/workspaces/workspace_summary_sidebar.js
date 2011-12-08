;
(function(ns) {
    ns.views.WorkspaceSummarySidebar = ns.views.Base.extend({
        className: "workspace_summary_sidebar",

        additionalContext : function() {
            return {canUpdate : this.model.canUpdate()};
        }
    });
})(chorus);
