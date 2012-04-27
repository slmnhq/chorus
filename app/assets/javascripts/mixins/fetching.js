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

    dataStatusOk: function(data, xhr) {
        var badStatus = xhr && xhr.status >= 300
        return !badStatus && !_.include(["needlogin", "fail"], data.status);
    },

    dataErrors: function(data) {
        return data.errors || data.message;
    },

    parseErrors: function(data, xhr) {
        if (data.status == "needlogin") {
            chorus.session.trigger("needsLogin");
        }
        if (this.dataStatusOk(data, xhr)) {
            this.loaded = true;
            delete this.serverErrors;
        } else {
            this.errorData = data.response;
            this.serverErrors = this.dataErrors(data);
            return true;
        }
    }
};
