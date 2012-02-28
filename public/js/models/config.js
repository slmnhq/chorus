chorus.models.Config = chorus.models.Base.extend({
    constructorName: "Config",
    urlTemplate:"config/",

    isExternalAuth: function() {
        return this.get("externalAuth")
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