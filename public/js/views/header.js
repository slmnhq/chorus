; (function($, ns) {
    ns.Header = chorus.views.Base.extend({
        className : "header",
        context : function() {
            var name = chorus.user.fullName;
            if (name.length > 20) {
                name = chorus.user.firstName + ' ' + chorus.user.lastName[0] + '.';
            }

            return {
                userName : name
            }
        }
    });
})(jQuery, chorus.views);