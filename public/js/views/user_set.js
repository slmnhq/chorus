(function($, ns) {
    ns.UserSet = chorus.views.Base.extend({
        className : "user_set",

        additionalContext : function (ctx) {
            return { loaded : this.collection.loaded };
        }
    });
})(jQuery, chorus.views);
