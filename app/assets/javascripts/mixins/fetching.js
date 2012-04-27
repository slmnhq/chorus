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

    dataStatusOk: function(data) {
        return !_.include(["needlogin", "fail"], data.status);
    },

    dataErrors: function(data) {
        return data.message;
    },

    parseErrors: function(data) {
        if (data.status == "needlogin") {
            chorus.session.trigger("needsLogin");
        }
        if (this.dataStatusOk(data)) {
            this.loaded = true;
            delete this.serverErrors;
        } else {
            this.errorData = data.resource && data.resource[0];
            this.serverErrors = this.dataErrors(data);
            return true;
        }
    }
};
