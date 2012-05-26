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
                var data = xhr.responseText && !!xhr.responseText.trim() && JSON.parse(xhr.responseText);
                collection_or_model.parseErrors(data);
                collection_or_model.trigger("fetchFailed", collection_or_model, xhr);
                collection_or_model.respondToErrors(xhr);
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

        dataErrors: function(data) {
            return data.errors;
        },

        respondToErrors: function(xhr) {
            if (xhr.status === 401) {
                chorus.session.trigger("needsLogin");
            } else if (xhr.status == 403) {
                this.trigger("resourceForbidden");
            } else if (xhr.status == 404) {
                this.trigger("resourceNotFound");
            } else {
                chorus.toast("server_error");
            }
        },

        parseErrors: function(data) {
            this.errorData = data.response;
            this.serverErrors = this.dataErrors(data);
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

