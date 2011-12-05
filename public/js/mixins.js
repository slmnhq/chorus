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
})(chorus);