(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        authorDisplayName : function() {
            var author = this.get("author");
            return [author.firstName, author.lastName].join(" ")
        }
    });
})(chorus.models);
