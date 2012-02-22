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
            _.defer(_.bind(callback, context))
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
    safePGName: function() {
        function encode(name) {
            var isSafe = name.match(/^[a-z_"][a-zA-Z0-9_"]*/);
            return isSafe ? name : '"' + name + '"';
        }

        return _.map(arguments, function(arg) {
            return encode(arg)
        }).join('.')
    }
}

chorus.Mixins.Fetching = {
    fetchIfNotLoaded: function(options) {
        if (this.loaded) {
            return;
        }
        if (!this.fetching) {
            this.fetch(options);
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

    getColumnLabel : function(columnName) {
        return columnName;
    },

    getSortedRows : function(rows) {
        return rows;
    },

    columnOrientedData: function() {

        var columns = this.getColumns();
        var rows = this.getSortedRows(this.getRows());

        var self = this;
        return _.map(columns, function (column) {
            var name = column.name;
            return {
                name: self.getColumnLabel(name),
                type:column.typeCategory,
                values:_.pluck(rows, name)
            };
        });
    },

    dataStatusOk: function(data) {
        if (data.status != "ok") return false;

        if (data.resource && data.resource[0] && data.resource[0].state == "failed") {
            return false
        }

        return true
    },

    dataErrors: function(data) {
        if (data.message && data.message.length) {
            return data.message
        }

        if (data.resource && data.resource[0] && data.resource[0].result) {
            return [data.resource[0].result]
        }
    },

    errorMessage:function () {
        return this.serverErrors && this.serverErrors[0] && this.serverErrors[0].message;
    }
}

chorus.Mixins.VisHelpers = {
    labelFormat : function(label, maxLength) {
        maxLength = maxLength || (typeof label == "number" ? 6 : 15)

        if ((typeof label == "number") && label.toString().length > maxLength){
            return label.toExponential(2)
        } else if(label.toString().length > maxLength) {
            return label.toString().slice(0, maxLength-1) + "…"
        } else {
            return label.toString();
        }
    }
}
