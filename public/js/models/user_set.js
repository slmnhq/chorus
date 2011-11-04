(function(ns) {
    ns.UserSet = ns.Collection.extend({
        model : ns.User,
        urlTemplate : "user/"
    });
})(chorus.models);
