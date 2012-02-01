_.extend(sinon.fakeServer, {

    reset: function() {
        this.requests = [];
    },

    creates: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "POST";
        });
    },

    fetches: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "GET";
        });
    },

    updates: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "PUT"
        });
    },

    destroys: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "DELETE";
        });
    },

    lastRequest: function() {
        return _.last(this.requests);
    },

    lastCreate: function() {
        return _.last(this.creates());
    },

    lastFetch: function() {
        return _.last(this.fetches());
    },

    lastUpdate: function() {
        return _.last(this.updates());
    },

    lastDestroy: function() {
        return _.last(this.destroys());
    },

    lastFetchFor: function(model, options) {
        options = options || {};
        options.method = 'read';
        return _.last(_.filter(this.fetches(), function(potentialRequest) {
           return (new URI(potentialRequest.url)).equals(model.url(options));
        }));
    },

    lastFetchAllFor : function(model, overrides) {
        return this.lastFetchFor(model, _.extend({ rows : 1000}, overrides));
    },

    completeFetchFor: function(model, results, options, pagination) {
        if (results) {
            results = results.attributes ? results.attributes : results;
        } else if (model instanceof Backbone.Model) {
            results = model.attributes;
        } else {
            results = [];
        }

        var fetch = this.lastFetchFor(model, options)
        if(fetch) {
            fetch.succeed(results, pagination);
        } else {
            throw "No fetch found for " + model.url() + ". Found fetches for: [" + _.pluck(this.fetches(), 'url').join(', ') + "]";
        }
    },

    completeFetchAllFor: function(model, results, options, pagination) {
        options = options || {page: 1, rows: 1000};
        pagination = pagination || {page: 1, total: 1, records: 1};
        this.completeFetchFor(model, results, options, pagination);
    },

    completeAllFetches: function(pagination) {
        pagination = pagination || {page: 1, total: 1, records: 1};
        _.each(this.fetches(), function(request) {
            request.succeed([], pagination);
        });
    }
});

_.extend(sinon.FakeXMLHttpRequest.prototype, {
    succeed: function(models, pagination) {
        if (!_.isArray(models)) models = [models];
        var resource = _.map(models, function(model) {
            if (model instanceof Backbone.Model) {
                return model.attributes;
            } else {
                return model;
            }
        });

        return this.respond(
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
                status: "ok",
                resource: resource,
                pagination: pagination
            })
        );
    },

    fail: function(message) {
        return this.respond(
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
                status: "fail",
                resource: [],
                message: message
            })
        );
    },

    error: function(message) {
        return this.respond(
            404,
            {},
            ''
        )
    }
});
