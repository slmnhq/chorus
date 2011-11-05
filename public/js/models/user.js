(function(ns) {
    ns.User = chorus.models.Base.extend({
        urlTemplate : "user/{{userName}}"
    });
})(chorus.models);
