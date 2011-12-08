;
(function(ns) {
    ns.views.WorkspaceSummarySidebar = ns.views.Base.extend({
        className: "workspace_summary_sidebar",

        additionalContext : function() {
            return {
                canUpdate : this.model.canUpdate(),
                imageUrl : this.model.imageUrl(),
                hasImage : this.model.hasImage()

            };
        }
    });
})(chorus);
