;
(function(ns) {
    ns.Mixins = ns.Mixins || {};

    ns.Mixins.Events = {
        forwardEvent: function(eventName, target) {
            this.bind(eventName, function() {
                var args = _.toArray(arguments);
                args.unshift(eventName);
                target.trigger.apply(target, args);
            });
        }
    }

    ns.Mixins.ViewUtils = {
        disableButtonWithSpinner : function(buttonSelector, translationKey) {
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
                this.$(buttonSelector).
                    text(t(translationKey)).
                    append(spinner.el).
                    attr("disabled", "disabled").
                    addClass("expanded");
        },

        restoreDisabledButton : function(buttonSelector, translationKey) {
            // $.text(val) clears the selected element, so .text here kills the spinner inside the button.
            this.$(buttonSelector).text(t(translationKey)).removeClass("expanded").removeAttr("disabled");
        }
    }
})(chorus);