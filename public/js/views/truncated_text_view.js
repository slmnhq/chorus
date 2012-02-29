chorus.views.TruncatedText = chorus.views.Base.extend({
    className: "truncated_text",

    events: {
        "click .links a": "toggleMore"
    },

    additionalContext: function() {
        return {
            text: this.model.get(this.options.attribute)
        }
    },

    postRender: function() {
        if (this.$(".original").height() > this.$(".styled_text").height()) {
            $(this.el).addClass('expandable');
        } else {
            $(this.el).removeClass('expandable');
        }
    },

    toggleMore: function(e) {
        e.preventDefault();
        $(this.el).toggleClass("expanded");
    }
});

