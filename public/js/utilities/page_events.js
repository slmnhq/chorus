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

chorus.utilities.PageEvents.prototype.broadcast = function(eventName, argsArray) {
    var list = this.subscriptions[eventName];
    if (!list) {
        return;
    }
    
    _.each(list, function(binding) {
        binding.callback.apply(binding.context, argsArray);
    });
}

chorus.PageEvents = new chorus.utilities.PageEvents();