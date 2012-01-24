_.extend(sinon.fakeServer, {
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

    lastFetchFor: function(model) {
        return _.last(_.filter(this.fetches(), function(potentialRequest) {
           return (new URI(potentialRequest.url)).equals(model.url());
        }));
    },

    completeFetchFor: function(model, results) {
        results = results || [model.attributes];
        var fetch = this.lastFetchFor(model)
        if(fetch) {
            fetch.succeed(results);
        } else {
            throw "No fetch found for " + model.url() + ". Found fetches for: [" + _.pluck(this.fetches(), 'url').join(', ') + "]";
        }
    },

    completeAllFetches: function() {
        _.each(this.fetches(), function(request) {
            request.succeed([]);
        });
    }
});

_.extend(sinon.FakeXMLHttpRequest.prototype, {
    succeed: function(models) {
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
                resource: resource
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
    }
});
