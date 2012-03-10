chorus.views.TruncatedText = chorus.views.Base.extend({
    constructorName: "TruncatedText",
    className: "truncated_text",

    events: {
        "click .links a": "toggleMore",
        "click .original a": "openLink"
    },

    additionalContext: function() {
        var value = this.model.get(this.options.attribute)
        if(this.options.attributeIsHtmlSafe && value) {
            value = new Handlebars.SafeString(value);
        }
        return {
            text: value
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
    },

    openLink: function(event) {
        event.preventDefault();
        window.open($(event.currentTarget).attr("href"))
    }
});

