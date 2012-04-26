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

    lastUpdateFor: function(model) {
        return _.last(_.filter(this.updates(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url());
            return uri.equals(modelUri);
        }));
    },

    lastDestroyFor: function(model) {
        return _.last(_.filter(this.destroys(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url());
            return uri.equals(modelUri);
        }));
    },

    lastCreateFor: function(model) {
        return _.last(_.filter(this.creates(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url());
            return uri.equals(modelUri);
        }));
    },

    lastFetchFor: function(model, options) {
        options = options || {};
        options.method = 'read';
        return _.last(_.filter(this.fetches(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url(options));

            if (!options.requireRows) {
                uri.removeSearch("rows");
                modelUri.removeSearch("rows");
            }
            return uri.equals(modelUri);
        }));
    },

    lastFetchAllFor: function(model, overrides) {
        return this.lastFetchFor(model, _.extend({ rows: 1000, requireRows: true}, overrides));
    },

    makeFakeResponse: function(modelOrCollection, response) {
        if (response) {
            return response.attributes ? response.attributes : response;
        } else if (modelOrCollection instanceof Backbone.Model) {
            return modelOrCollection.attributes;
        } else {
            return [];
        }
    },

    completeFetchFor: function(model, response, options, pagination) {
        response = this.makeFakeResponse(model, response);
        var fetch = this.lastFetchFor(model, options)
        if (fetch) {
            fetch.succeed(response, pagination);
        } else {
            throw "No fetch found for " + model.url() + ". Found fetches for: [" + _.pluck(this.fetches(), 'url').join(', ') + "]";
        }
    },

    completeUpdateFor: function(model, response) {
        response = this.makeFakeResponse(model, response);
        var create = this.lastUpdateFor(model);
        if (create) {
            create.succeed(response);
        } else {
            throw "No update found for " + model.url() + ". Found updates for: [" + _.pluck(this.creates(), 'url').join(', ') + "]";
        }
    },

    completeSaveFor: function(model, response) {
        response = this.makeFakeResponse(model, response);
        var create = this.lastCreateFor(model);
        if (create) {
            create.succeed(response);
        } else {
            throw "No create found for " + model.url() + ". Found creates for: [" + _.pluck(this.creates(), 'url').join(', ') + "]";
        }
    },

    completeFetchAllFor: function(model, results, options, pagination) {
        options = options || {page: 1, rows: 1000};
        pagination = pagination || {page: 1, total: 1, records: results ? results.length : 1};
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

    fail: function(message, resource) {
        resource || (resource = [])
        return this.respond(
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
                status: "fail",
                resource: resource,
                message: message || "something went wrong!"
            })
        );
    },

    failForbidden: function(message, resource) {
        this.fail(message, resource);
    },

    failUnauthorized: function(message, resource) {
        return this.respond(
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
                status: "fail",
                resource: resource || [],
                message: message || "something went wrong!"
            })
        );
    },

    params: function() {
        var uri;
        if (this.requestBody) {
            uri = new URI("?" + this.requestBody)
        } else {
            uri = new URI(this.url);
        }

        return uri.search(true);
    },

    error: function(message) {
        return this.respond(
            404,
            {},
            ''
        )
    }
});
