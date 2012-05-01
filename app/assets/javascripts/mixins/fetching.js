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

    fetch: function(options) {
        this.fetching = true;
        options || (options = {});
        var success = options.success, error = options.error;
        options.success = this.makeSuccessFunction(options, success);
        options.error = function(collection, xhr) {
            var data = xhr.responseText && !!xhr.responseText.trim() && JSON.parse(xhr.responseText);
            collection.parseErrors(data, xhr);
            if (error) error(collection, xhr);
            collection.trigger("fetchFailed", collection, xhr)
        };

        return this._super('fetch', [options]).always(_.bind(function() {
            this.fetching = false;
        }, this));
    },

    parse: function(data, xhr) {
        this.loaded = true;
        this.pagination = data.pagination;
        delete this.serverErrors;
        return data.response;
    },

    dataErrors: function(data) {
        return data.errors;
    },

    parseErrors: function(data, xhr) {
        if (xhr.status === 401) {
            chorus.session.trigger("needsLogin");
        }
        this.errorData = data.response;
        this.serverErrors = this.dataErrors(data);
    }
};
