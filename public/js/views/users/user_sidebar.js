chorus.views.UserSidebar = chorus.views.Sidebar.extend({
    className:"user/sidebar",
    entityType:"user",
    subviews:{
        '.activities':'activityList'
    },

    setup: function() {
        if (this.model) this.setUser(this.model);

        this.config = chorus.models.Config.instance();
        this.requiredResources.push(this.config);
        chorus.PageEvents.subscribe("user:selected", this.setUser, this);
    },

    additionalContext:function () {
        var ctx = {};
        if (this.model) {
            var name = this.model.get("userName");
            var userIsLoggedIn = name == chorus.session.user().get("userName");
            var userIsAdmin = chorus.session.user().get("admin");

            _.extend(ctx, {
                displayName: this.model.displayName(),
                permission: userIsLoggedIn || userIsAdmin,
                listMode: this.options.listMode,
                changePasswordAvailable: userIsLoggedIn && !this.config.isExternalAuth(),
                isInEditMode: this.options.editMode
            });
        }

        return ctx;
    },

    setUser: function(user) {
        this.resource = this.model = user;
        this.collection = this.model.activities();
        this.collection.fetch();
        this.bindings.add(this.collection, "changed", this.render);
        this.activityList = new chorus.views.ActivityList({ collection:this.collection, additionalClass:"sidebar" });
        this.render();
    }
});
