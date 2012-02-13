chorus.utilities.PageEvents = function() {
    this.subscriptions = {};
}

chorus.utilities.PageEvents.prototype.reset = function() {
    this.subscriptions = {};
}

chorus.utilities.PageEvents.prototype.subscribe = function(eventName, callback, context) {
    this.subscriptions[eventName] || (this.subscriptions[eventName] = []);
    this.subscriptions[eventName].push({callback: callback, context: context});
}

chorus.utilities.PageEvents.prototype.broadcast = function(eventName, argsArray) {
    var list = this.subscriptions[eventName] || [];
    _.each(list, function(binding) {
        binding.callback.apply(binding.context, argsArray);
    });
}

chorus.PageEvents = new chorus.utilities.PageEvents();