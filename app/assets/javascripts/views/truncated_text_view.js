chorus.views.TruncatedText = chorus.views.Base.extend({
    constructorName: "TruncatedText",
    templateName: "truncated_text",

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
        this.show();
    },

    show: function() {
        var numLines = 2;

        _.defer(_.bind(function() {

            if (this.options.extraLine) {
                numLines++;
                this.$(".styled_text").addClass("extra_line");
            }

            var text = this.$(".original");
            var heightLimit = parseInt(text.css("line-height")) * numLines;
            if (text.height() > heightLimit) {
                $(this.el).addClass('expandable');
            } else {
                $(this.el).removeClass('expandable');
            }
        }, this));
    },

    toggleMore: function(e) {
        e && e.preventDefault();
        e.stopPropagation();
        $(this.el).toggleClass("expanded");
    },

    openLink: function(e) {
        e && e.preventDefault();
        window.open($(e.currentTarget).attr("href"))
    }
});

