;(function(ns) {
    ns.views.UserShowSidebar = ns.views.Base.extend({
       className : "user_show_sidebar",

        additionalContext: function() {
            return {
               permission :  ((this.model.get("userName") == chorus.session.user().get("userName"))|| chorus.session.user().get("admin"))
            }
        }
    })

    ns.alerts.UserDelete = ns.alerts.Base.extend({
    })
})(chorus);

