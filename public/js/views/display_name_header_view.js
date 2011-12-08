;(function($, ns) {
    ns.DisplayNameHeader = ns.Base.extend({
        className : "default_content_header",

        additionalContext : function(ctx) {
            return {
               title : this.model && this.model.loaded ? this.model.displayName() : ""
            }
        }
    })
})(jQuery, chorus.views);
