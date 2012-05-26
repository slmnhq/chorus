;
(function() {
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
        },

        makeSuccessFunction: function(options, success) {
            return function(collection, data, xhr) {
                if (!options.silent) {
                    collection.trigger('loaded');
                }
                if (success) {
                    success(collection, data, xhr);
                }
            };
        },

        underscoreKeys: transformKeys(_.underscored),
        camelizeKeys: transformKeys(_.camelize),

        fetch: function(options) {
            this.fetching = true;
            options || (options = {});
            var success = options.success, error = options.error;
            options.success = this.makeSuccessFunction(options, success);
            options.error = function(collection_or_model, xhr) {
                collection_or_model.handleRequestFailure("fetchFailed", xhr);
                if (error) error(collection_or_model, xhr);
            };

            return this._super('fetch', [options]).always(_.bind(function() {
                this.fetching = false;
            }, this));
        },

        parse: function(data, xhr) {
            this.loaded = true;
            this.pagination = data.pagination;
            delete this.serverErrors;
            return this.camelizeKeys(data.response);
        },

        handleRequestFailure: function(failureEvent, xhr) {
            var data = xhr.responseText && !!xhr.responseText.trim() && JSON.parse(xhr.responseText);
            this.parseErrors(data);
            this.trigger(failureEvent, this);
            this.respondToErrors(xhr.status);
        },

        parseErrors: function(data) {
            this.errorData = data.response;
            this.serverErrors = this.dataErrors(data);
        },

        respondToErrors: function(status) {
            if (status === 401) {
                chorus.session.trigger("needsLogin");
            } else if (status == 403) {
                this.trigger("resourceForbidden");
            } else if (status == 404) {
                this.trigger("resourceNotFound");
            } else {
                chorus.toast("server_error");
            }
        },

        dataErrors: function(data) {
            return data.errors;
        }
    };

    function transformKeys(keyFn) {
        var transformer = function(hash) {
            var result = _.isArray(hash) ? [] : {};
            _.each(hash, function(val, key) {
                var newKey = keyFn(key);
                if (_.isObject(val)) {
                    result[newKey] = transformer(val);
                } else {
                    result[newKey] = val;
                }
            }, this);
            return result;
        };

        return transformer;
    }
})();

