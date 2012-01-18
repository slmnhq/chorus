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
            var callbacksForThisEvent = this._callbacks && this._callbacks[eventName];
            var callbackAlreadyBound = _.any(callbacksForThisEvent, function(pair) {
                var boundCallback = pair && pair[0];
                return boundCallback === callback;
            });
            if (callbackAlreadyBound) return;

            this.bind(eventName, callback, context);
            this.bind(eventName, unbinder, this);

            function unbinder() {
                this.unbind(eventName, callback);
                this.unbind(eventName, unbinder);
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
