chorus.utilities.PageEvents = function() {
    this.reset();
}

chorus.utilities.PageEvents.prototype.reset = function() {
    this.subscriptions = {};
    this.subscriptionHandles = {};
}

chorus.utilities.PageEvents.prototype.subscribe = function(eventName, callback, context) {
    this.subscriptions[eventName] || (this.subscriptions[eventName] = []);
    var handle = _.uniqueId();
    var binding = {callback: callback, context: context};
    this.subscriptionHandles[handle] = {eventName: eventName, binding: binding};
    this.subscriptions[eventName].push(binding);
    return handle;
}

chorus.utilities.PageEvents.prototype.unsubscribe = function(handle) {
    var fullHandle = this.subscriptionHandles[handle];
    if(!fullHandle) {
        return;
    }

    var eventName = fullHandle.eventName;
    this.subscriptions[eventName] = _.without(this.subscriptions[eventName], fullHandle.binding);
}

// Really only used for tests
chorus.utilities.PageEvents.prototype.hasSubscription = function(eventName, callback, context) {
    var eventMatches = this.subscriptions[eventName];

    return eventMatches && _.find(eventMatches, function(eventMatch) {
        return eventMatch.callback == callback && eventMatch.context == context;
    })
}

chorus.utilities.PageEvents.prototype.broadcast = function(eventName) {
    var list = this.subscriptions[eventName];
    if (!list) {
        return;
    }

    var args = _.toArray(arguments);
    args.shift();

    _.each(list, function(binding) {
        binding.callback.apply(binding.context, args);
    });
}

chorus.PageEvents = new chorus.utilities.PageEvents();