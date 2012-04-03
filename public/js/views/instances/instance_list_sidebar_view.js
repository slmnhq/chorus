chorus.views.InstanceListSidebar = chorus.views.Sidebar.extend({
    constructorName: "InstanceListSidebarView",
    className:"instance_list_sidebar",
    useLoadingSection:true,

    subviews:{
        '.tab_control': 'tabs'
    },

    setup:function () {
        chorus.PageEvents.subscribe("instance:selected", this.setInstance, this);
        this.tabs = new chorus.views.TabControl(["activity", "configuration"]);
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
            workspaceCount:this.instance.usage().workspaceCount(),
            deleteable:this.instance.get("state") == "fault" && this.instance.get("provisionType") == "create",
            hasWorkspaceUsageInfo: this.model.hasWorkspaceUsageInfo()
        };
    },

    setupSubviews: function() {
        if (this.instance) {
            this.tabs.activity = new chorus.views.ActivityList({
                collection: this.instance.activities(),
                displayStyle:'without_object'
            });

            this.tabs.configuration = new chorus.views.InstanceConfigurationDetails({ model: this.instance });
        }
    },

    setInstance:function (instance) {
        this.resource = this.instance = this.model = instance;
        var account = this.instance.accountForCurrentUser();
        var instanceUsage = this.instance.usage();

        this.instance.activities().fetch();
        this.instance.accounts().fetch();
        account.fetch();
        instanceUsage.fetchIfNotLoaded();

        this.requiredResources.reset();
        this.requiredResources.push(this.instance.accounts())
        this.requiredResources.push(account)

        this.bindings.removeAll();
        this.bindings.add(this.instance.accounts(), "reset", this.render);
        this.bindings.add(account, "change", this.render);
        this.bindings.add(account, "fetchFailed", this.render);
        this.bindings.add(this.resource, "change", this.render);

        this.render();
    },

    postRender: function() {
        this.$("a.dialog").data("instance", this.instance);
        this._super("postRender");
    },

    canEditPermissions: function() {
        return !this.resource.isHadoop() && this.canEditInstance();
    },

    canEditInstance:function () {
        return (this.resource.owner().get("id") == chorus.session.user().get("id") ) || chorus.session.user().get("admin");
    }
});
