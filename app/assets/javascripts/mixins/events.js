chorus.Mixins.Events = {
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
            if(!pair) {
                return;
            }
            return pair[0] === callback && pair[1] === context;
        });
        if (callbackAlreadyBound) return;

        this.bind(eventName, callback, context);
        this.bind(eventName, unbinder, this);

        function unbinder() {
            this.unbind(eventName, callback, context);
            this.unbind(eventName, unbinder, this);
        }
    },

    onLoaded: function(callback, context) {
        if (this.loaded) {
            _.defer(_.bind(callback, context))
        } else {
            this.bind('loaded', callback, context)
        }
    }
};
