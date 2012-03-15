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

chorus.Mixins.Urls = {
    showUrl: function() {
        if (this.isDeleted()) return null;

        if (!this.showUrlTemplate) {
            throw "No showUrlTemplate defined";
        }

        var template = _.isFunction(this.showUrlTemplate) ? this.showUrlTemplate.apply(this, arguments) : this.showUrlTemplate;
        var attributes = _.isFunction(this.urlTemplateAttributes) ? this.urlTemplateAttributes() : this.attributes;

        var prefix = "#/"
        return prefix + Handlebars.compile(template)(attributes);
    }
};

chorus.Mixins.dbHelpers = {
    safePGName: function() {
        function encode(name) {
            var isSafe = name.match(chorus.ValidationRegexes.SafePgName());
            return isSafe ? name : '"' + name + '"';
        }

        return _.map(arguments, function(arg) {
            return encode(arg)
        }).join('.')
    },

    sqlEscapeString: function(string) {
        return string.replace(/'/g, "''");
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
    },

    fetchAllIfNotLoaded: function() {
        if (this.loaded) {
            return;
        }
        if (!this.fetching) {
            this.fetchAll();
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
