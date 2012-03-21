chorus.views.UserListSidebar = chorus.views.Sidebar.extend({
    className: "user_list_sidebar",
    subviews:{
        '.activities':'activityList'
    },

    setup: function() {
        if (this.model) this.setUser(this.model);

        chorus.PageEvents.subscribe("user:selected", this.setUser, this);
    },

    setUser: function(user) {
        this.resource = this.model = user;
        this.collection = this.model.activities();
        this.collection.fetch();
        this.bindings.add(this.collection, "changed", this.render);
        this.activityList = new chorus.views.ActivityList({ collection:this.collection, additionalClass:"sidebar" });
        this.render();
    },

    additionalContext: function() {
        return {
            displayName: this.model && this.model.displayName()
        };
    }
});
