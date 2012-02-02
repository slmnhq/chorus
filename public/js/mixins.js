chorus.Mixins = chorus.Mixins || {};

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
    },

    onLoaded: function(callback, context) {
        if (this.loaded) {
            callback.apply(context)
        } else {
            this.bind('loaded', callback, context)
        }
    }
};

chorus.Mixins.Urls = {
    showUrl: function(hidePrefix) {
        if (!this.showUrlTemplate) {
            throw "No showUrlTemplate defined";
        }

        var template = _.isFunction(this.showUrlTemplate) ? this.showUrlTemplate() : this.showUrlTemplate;

        var prefix = hidePrefix ? '' : "#/"
        return prefix + Handlebars.compile(template)(this.attributes);
    }
};

chorus.Mixins.dbHelpers = {
    safePGName: function(name) {
        var doQuote = false;
        if ((name !== name.toLowerCase())) {
            doQuote = true;
        }
        if (name && name[0].match(/[^a-z]/)) {
            doQuote = true;
        }
        return doQuote ? '"' + name + '"' : name;
    }
}

chorus.Mixins.Fetching = {
    fetchIfNotLoaded: function() {
        if (this.loaded) {
            return;
        }
        if (!this.fetching) {
            this.fetch();
        }
    }
}

chorus.Mixins.SQLResults = {
    getRows : function() {
        return this.get("rows");
    },

    getColumns : function() {
        return this.get("columns");
    },

    getErrors : function() {
        return this.attributes;
    },

    columnOrientedData: function() {
        var rows = this.getRows();
        var columns = this.getColumns();

        return _.map(columns, function (column) {
            var name = column.name;
            return {
                name:name,
                type:column.typeCategory,
                values:_.pluck(rows, name)
            };
        });
    },
    
    errorMessage:function () {
        var errors = this.getErrors();
        return (errors.executeResult !== 'success') && errors.message;
    }
}
