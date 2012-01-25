(function(ns) {
    ns.collections.UserSet = ns.collections.Base.extend({
        model : ns.models.User,
        urlTemplate : "user/"
    });
})(chorus);
