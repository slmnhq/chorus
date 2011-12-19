;(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        }
    });
})(chorus.models);
