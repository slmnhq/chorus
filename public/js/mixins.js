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
        },

        bindOnce: function(eventName, callback, context) {
            var self = this;

            this.bind(eventName, once);

            function once() {
                callback.apply(context, arguments);
                this.unbind(eventName, once);
            }
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
