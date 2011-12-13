;(function($, ns) {
    ns.views.Activity = chorus.views.Base.extend({
        className : "activity",

        additionalContext : function() {
            var author = this.model.author();
            var date = Date.parseFromApi(this.model.get("timestamp"));
            return {
                imageUrl : author.imageUrl(),
                headerHtml : this.model.headerHtml(),
                body : this.model.get("text"),
                timestamp : date && date.toRelativeTime()
            }
        }
    });
})(jQuery, chorus);