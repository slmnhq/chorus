jQuery.fn.extend({
    startLoading : function(translationKey) {
        if (this.isLoading()) return;

        var spinner = new Spinner({
                lines: 12,
                length: 3,
                width: 2,
                radius: 3,
                color: '#000',
                speed: 1,
                trail: 75,
                shadow: false
            }).spin();

        var originalText = this.text();
        var text = translationKey ? t(translationKey) : '';
        this.text(text).
            append(spinner.el).
            attr("disabled", "disabled").
            data("loading-original-text", originalText).
            addClass("is_loading");
    },

    stopLoading : function() {
        if (!this.isLoading()) return;
        // $.text(val) clears the selected element, so .text here kills the spinner inside the button.
        var originalText = this.data("loading-original-text");
        this.removeData("loading-original-text").removeClass("is_loading").removeAttr("disabled").text(originalText);
    },

    isLoading : function() {
        return !!this.data("loading-original-text");
    },

    outerHtml: function() {
        var div = $("<div></div>");
        return div.append(this.clone()).html();
    }
});
