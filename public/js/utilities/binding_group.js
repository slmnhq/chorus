chorus.BindingGroup = function chorus$BindingGroup(defaultContext) {
    this.defaultContext = defaultContext;
    this.bindings = [];
};

_.extend(chorus.BindingGroup.prototype, {
    add:function (eventSource, eventNameString, callback, context) {
        context = context || this.defaultContext;
        var eventNames = eventNameString.split(" ");

        _.each(eventNames, function (eventName) {
            this.bindings.push({
                eventSource:eventSource,
                eventName:eventName,
                callback:callback,
                context:context
            });

            eventSource.bind(eventName, callback, context);
        }, this);
    },

    remove:function (eventSource, eventName, callback) {
        var matchingBindings = _.filter(this.bindings, function (binding) {
            return (eventSource ? binding.eventSource === eventSource : true) &&
                (eventName ? binding.eventName === eventName : true) &&
                (callback ? binding.callback === callback : true);
        }, this);

        _.each(matchingBindings, function (binding) {
            binding.eventSource.unbind(binding.eventName, binding.callback);
        });

        this.bindings = _.difference(this.bindings, matchingBindings);
    },

    removeAll:function () {
        this.remove();
    }
});
