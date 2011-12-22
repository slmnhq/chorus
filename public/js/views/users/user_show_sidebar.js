;
(function(ns) {
    ns.views.UserShowSidebar = ns.views.Base.extend({
        className : "user_show_sidebar",
        entityType : "user",

        setup : function() {
            this.collection = this.model.activities();
            this.collection.fetch();
            this.collection.bind("changed", this.render, this);
            this.activityList = new ns.views.ActivityList({ collection : this.collection, headingText : t("user.activity"), additionalClass : "sidebar" });
        },

        additionalContext: function() {
            return {
                permission :  ((this.model.get("userName") == chorus.session.user().get("userName")) || chorus.session.user().get("admin"))
            }
        },

        postRender : function() {
            this.activityList.el = this.$(".activities");
            this.activityList.delegateEvents();
            this.activityList.render();
        }
    });

    ns.alerts.UserDelete = ns.alerts.Base.extend({
    })
})(chorus);

