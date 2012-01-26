;(function(ns) {
    ns.models.Config = ns.models.Base.extend({
        urlTemplate : "config/"
    }, {
        instance : function() {
            if (!this._instance) {
                this._instance = new chorus.models.Config()
            }
            return this._instance
        }
    });
})(chorus);