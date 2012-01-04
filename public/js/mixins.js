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
    };

    ns.Mixins.Urls = {
        showUrl: function(hidePrefix) {
            if (!this.showUrlTemplate) {
                throw "No showUrlTemplate defined";
            }

            var prefix = hidePrefix ? '' : "#/"
            return prefix + Handlebars.compile(this.showUrlTemplate)(this.attributes);
        }
    }
})(chorus);
