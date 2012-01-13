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
