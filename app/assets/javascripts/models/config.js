chorus.models.Config = chorus.models.Base.extend({
    constructorName: "Config",
    urlTemplate:"config/",

    isExternalAuth: function() {
        return this.get("external_auth_enabled")
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
            this._instance = new chorus.models.Config()
            this._instance.fetch()
        }
        return this._instance
    }
});
