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
