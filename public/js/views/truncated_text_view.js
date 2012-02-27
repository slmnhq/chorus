chorus.views.TruncatedText = chorus.views.Base.extend({
    className:"truncated_text",
    isExpanded:false,

    events:{
        "click .links a":"toggleMore"
    },

    additionalContext:function () {
        var originalText = this.model.get(this.options.attribute);
        if (this.isExpanded) {
            var displayText = originalText;
        } else {
            var displayText = this.truncate(originalText, this.options.characters, this.options.lines);
        }

        return {
            truncateContext: {
                text: displayText,
                isExpanded: this.isExpanded
            }
        }
    },

    toggleMore: function(e) {
        e.preventDefault();
        this.isExpanded = !this.isExpanded;

        this.render();
        if (this.isExpanded) {
            this.$("a.more").addClass("hidden");
            this.$("a.less").removeClass("hidden");
        } else {
            this.$("a.more").removeClass("hidden");
            this.$("a.less").addClass("hidden");
        }
    },

    truncate:function truncate(text, characters, lines) {

        if (!text) {
            return '';
        }

        var index = characters;
        if (lines) {
            index = Math.min(index, text.split('\n').slice(0, lines).join('\n').length);
        }

        var c;
        for (var i = index - 1; i > 0; i--) {
            c = text[i];

            if (c == "<") {
                index = i;
                break;
            } else if (c == ">") {
                break;
            }
        }

        return text.substring(0, index);
    }
});

