chorus.views.InstanceListSidebar = chorus.views.Sidebar.extend({

    className:"instance_list_sidebar",
    useLoadingSection:true,

    subviews:{
        '.activity_list':'activityList',
        '.tab_control':'tabControl'
    },

    setup:function () {
        chorus.PageEvents.subscribe("instance:selected", this.setInstance, this);
        this.tabControl = new chorus.views.TabControl([
            {name:'activity', selector:".activity_list"},
            {name:'configuration', selector:".configuration_detail"}
        ]);
    },

    additionalContext:function () {
        if (!this.model) {
            return {};
        }
        var account = this.model.accountForCurrentUser();
        return {
            isGreenplum: this.model.isGreenplum(),
            dbUserName:this.model.get('sharedAccount') && this.model.get('sharedAccount').dbUserName,
            userHasAccount:account && account.has("id"),
            userCanEditPermissions:this.canEditPermissions(),
            userCanEditInstance:this.canEditInstance(),
            instanceAccountsCount:this.instance.accounts().length,
            workspaceCount:this.instance.usage().get('workspaces').length,
            deleteable:this.instance.get("state") == "fault" && this.instance.get("provisionType") == "create",
            isHadoop: this.model.isHadoop()
        };
    },

    activityList:function () {
        if (this.instance) {
            return new chorus.views.ActivityList({
                collection:this.model.activities(),
                displayStyle:'without_object'
            });
        }
    },

    setInstance:function (instance) {
        this.resource = this.instance = this.model = instance;
        var account = this.instance.accountForCurrentUser();
        var instanceUsage = this.instance.usage();

        this.instance.activities().fetch();
        this.instance.fetchIfNotLoaded();
        this.instance.accounts().fetch();
        account.fetch();
        instanceUsage.fetchIfNotLoaded();

        this.requiredResources.reset();
        this.requiredResources.push(this.instance)
        this.requiredResources.push(this.instance.accounts())
        this.requiredResources.push(account)
        this.requiredResources.push(instanceUsage)

        this.bindings.removeAll();
        this.bindings.add(this.instance.accounts(), "reset", this.render);
        this.bindings.add(account, "change", this.render);
        this.bindings.add(account, "fetchFailed", this.render);
        this.bindings.add(this.resource, "change", this.render);

        this.render();
    },

    canEditPermissions: function() {
        return !this.resource.isHadoop() && this.canEditInstance();
    },

    canEditInstance:function () {
        return (this.resource.owner().get("id") == chorus.session.user().get("id") ) || chorus.session.user().get("admin");
    }
});
