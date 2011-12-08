;(function($, ns) {
    ns.views.TruncatedText = ns.views.Base.extend({
        className : "truncated_text",
        isExpanded : false,

        events : {
            "click .links a" : "toggleMore"
        },

        additionalContext: function() {
            var ctx = {isExpanded : this.isExpanded};
            var originalText = this.model.get(this.options.attribute);
            var pieces = truncate(originalText, this.options.characters, this.options.lines);
            var displayText = pieces[0];
            var truncatedText = pieces[1];

            var wasTruncated = !!pieces[1];

            _.extend(ctx, {
                displayText : displayText,
                truncatedText : truncatedText,
                doTruncate : wasTruncated
            });

            // scope our additional context to avoid any possible conflicts with model attributes
            return { truncateContext : ctx }
        },

        toggleMore : function(e) {
            e.preventDefault();
            this.isExpanded = !this.isExpanded;
            this.$("> div").toggleClass("more", this.isExpanded);
        }
    });

    function truncate(text, characters, lines) {
        if (!text) {
            return ['', ''];
        }

        var index = characters;
        if (lines) {
            var lineIndex = text.split('\n').slice(0, lines).join('\n').length;
            index = Math.min(index, lineIndex);
        }

        return [text.substring(0, index), text.substring(index)];
    }
})(jQuery, chorus);