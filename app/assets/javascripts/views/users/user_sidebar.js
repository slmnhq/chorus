chorus.views.UserSidebar = chorus.views.Sidebar.extend({
    templateName:"user/sidebar",
    entityType:"user",

    subviews:{
        '.tab_control': 'tabs'
    },

    setup: function() {
        this.config = chorus.models.Config.instance();
        this.requiredResources.push(this.config);

        this.tabs = new chorus.views.TabControl(["activity"]);
        if (this.model) this.setUser(this.model);

        chorus.PageEvents.subscribe("user:selected", this.setUser, this);
    },

    additionalContext:function () {
        var ctx = {};
        if (this.model) {
            var currentUserCanEdit = this.model.currentUserCanEdit();

            _.extend(ctx, {
                displayName: this.model.displayName(),
                permission: currentUserCanEdit,
                listMode: this.options.listMode,
                changePasswordAvailable: currentUserCanEdit && !this.config.isExternalAuth(),
                isInEditMode: this.options.editMode,
                deleteAvailable : this.model.currentUserCanDelete()
            });
        }

        return ctx;
    },

    setUser: function(user) {
        if (!user) return;
        this.resource = this.model = user;
        this.collection = this.model.activities();
        this.collection.fetch();
        this.bindings.add(this.collection, "changed", this.render);
        this.tabs.activity = new chorus.views.ActivityList({ collection:this.collection, additionalClass:"sidebar" });
        this.render();
    }
});
