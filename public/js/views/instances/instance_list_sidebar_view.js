chorus.views.InstanceListSidebar = chorus.views.Sidebar.extend({

    className:"instance_list_sidebar",
    useLoadingSection:true,

    subviews:{
        '.activity_list':'activityList',
        '.tab_control':'tabControl'
    },

    setup:function () {
        this.bind("instance:selected", this.setInstance, this);
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
            userCanEditInstance:this.canEditInstance(),
            instanceAccountsCount:this.instance.accounts().length,
            workspaceCount:this.instance.usage().get('workspaces').length,
            deleteable:this.instance.get("state") == "fault" && this.instance.get("provisionType") == "create"
        };
    },

    activityList:function () {
        if (this.instance) {
            return new chorus.views.ActivityList({collection:this.model.activities(), displayStyle:'without_object'});
        }
    },

    setInstance:function (instance) {
        this.requiredResources.reset();

        this.resource = this.instance = this.model = instance;

        this.instance.activities().fetch();
        this.requiredResources.push(this.instance)
        this.instance.fetchIfNotLoaded();

        this.instance.accounts().fetch();
        this.requiredResources.push(this.instance.accounts())
        this.instance.accounts().bind("reset", this.render, this);

        var account = this.instance.accountForCurrentUser();
        this.requiredResources.push(account)
        account.bind("change", this.render, this);
        account.bind("fetchFailed", this.render, this);
        account.fetch();

        var instanceUsage = this.instance.usage();
        instanceUsage.fetchIfNotLoaded();
        this.requiredResources.push(instanceUsage)

        this.resource.bind("change", this.render, this);
        this.render();
    },

    canEditInstance:function () {
        return (this.resource.owner().get("id") == chorus.session.user().get("id") ) || chorus.session.user().get("admin");
    }
});
