chorus.models.Config = chorus.models.Base.extend({
    constructorName: "Config",
    urlTemplate:"config/",

    isExternalAuth: function() {
        return this.get("externalAuth")
    },

    timezoneOffset: function() {
        if (this.has("timezoneOffset")) {
            var hours = parseInt(this.get("timezoneOffset"));
            return hours * 100;
        }
    }
 }, {
    instance:function () {
        if (!this._instance) {
            this._instance = new chorus.models.Config();
        }

        // Decoupling the creation of new instances from the fetching action
        // because when the user isn't logged in, the server responds with
        // 200 (OK), but no config information returns. If so, we need
        // to reload its information at another time.
        if(!this._instance.loaded && !this._instance.fetching) {
            this._instance.fetch();
        }

        return this._instance;
    }
});
