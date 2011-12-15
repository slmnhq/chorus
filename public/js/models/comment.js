;(function(ns) {
    ns.models.Comment = ns.models.Base.extend({
        creator: function() {
            return this._creator || (this._creator = new ns.models.User(this.get("author")));
        }
    });
})(chorus);
