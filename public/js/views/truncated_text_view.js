;(function($, ns) {
    ns.views.TruncatedText = ns.views.Base.extend({
        className : "truncated_text",
        isExpanded : false,

        events : {
            "click .links a" : "toggleMore"
        },

        additionalContext: function() {
            var ctx = {isExpanded : this.isExpanded};
            var text = this.model.get(this.options.attribute);
            if (this.model.loaded && text && text.length > this.options.length) {
                _.extend(ctx, {
                    displayText : text.substring(0, this.options.length),
                    truncatedText : text.substring(this.options.length),
                    doTruncate : true
                });
            } else {
                _.extend(ctx, {
                    doTruncate : false,
                    fullText : text
                });
            }

            // scope our additional context to avoid any possible conflicts with model attributes
            return { truncateContext : ctx }
        },

        toggleMore : function(e) {
            e.preventDefault();
            this.isExpanded = !this.isExpanded;
            this.$("> div").toggleClass("more", this.isExpanded);
        }
    });
})(jQuery, chorus);