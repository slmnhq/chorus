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

    fetchFor: function(model) {
        return _.find(this.fetches(), function(request) {
            return (new URI(request.url)).equals(model.url());
        })
    },

    completeFetchFor: function(model, results) {
        results = results || [model.attributes];
        var request = _.find(this.fetches(), function(potentialRequest) {
           return potentialRequest.url == model.url()
        });

        request.succeed(results);
    }
});

_.extend(sinon.FakeXMLHttpRequest.prototype, {
    succeed: function(resource) {
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
