chorus.views.UserShowSidebar = chorus.views.Sidebar.extend({
    className:"user_show_sidebar",
    entityType:"user",
    subviews:{
        '.activities':'activityList'
    },

    setup:function () {
        this.collection = this.model.activities();
        this.collection.fetch();
        this.bindings.add(this.collection, "changed", this.render);
        this.activityList = new chorus.views.ActivityList({ collection:this.collection, additionalClass:"sidebar" });

        this.config = chorus.models.Config.instance();
        this.requiredResources.push(this.config);
    },

    additionalContext:function () {
        var userIsLoggedIn = this.model.get("userName") == chorus.session.user().get("userName");
        var userIsAdmin = chorus.session.user().get("admin");
        return {
            permission: userIsLoggedIn || userIsAdmin,
            changePasswordAvailable: userIsLoggedIn && !this.config.isExternalAuth()
        }
    }
});
