(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        author : function() {
            return new chorus.models.User(this.get("author"))
        }
    });
})(chorus.models);
