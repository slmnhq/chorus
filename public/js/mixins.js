;
(function(ns) {
    ns.Mixins = ns.Mixins || {};

    ns.Mixins.EventRelay = {
        relay : function relay(source, target, eventName) {
            source.bind(eventName, function() {
                var args = _.toArray(arguments);
                args.unshift(eventName)
                target.trigger.apply(target, args);
            });
        }
    }
})(chorus);