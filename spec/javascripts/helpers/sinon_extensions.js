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
