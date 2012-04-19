chorus.views.InstanceListSidebar = chorus.views.Sidebar.extend({
    constructorName: "InstanceListSidebarView",
    className: "instance_list_sidebar",
    useLoadingSection: true,

    subviews: {
        '.tab_control': 'tabs'
    },

    setup: function() {
        chorus.PageEvents.subscribe("instance:selected", this.setInstance, this);
        this.tabs = new chorus.views.TabControl(["activity", "configuration"]);
    },

    additionalContext: function() {
        if (!this.model) {
            return {};
        }
        var account = this.model.accountForCurrentUser();
        return {
            isGreenplum: this.model.isGreenplum(),
            dbUserName: this.model.get('sharedAccount') && this.model.get('sharedAccount').dbUserName,
            userHasAccount: account && account.has("id"),
            userCanEditPermissions: this.canEditPermissions(),
            userCanEditInstance: this.canEditInstance(),
            instanceAccountsCount: this.instance.accounts().length,
            deleteable: this.instance.isFault() && this.instance.get("provisionType") == "create",
            isProvisioning: this.instance.isProvisioning(),
            isFault: this.instance.isFault(),
            isOnline: this.instance.isOnline()
        };
    },

    setupSubviews: function() {
        if (this.instance) {
            this.tabs.activity = new chorus.views.ActivityList({
                collection: this.instance.activities(),
                displayStyle: 'without_object'
            });

            this.tabs.configuration = new chorus.views.InstanceConfigurationDetails({ model: this.instance });
        }
    },

    setInstance: function(instance) {
        this.resource = this.instance = this.model = instance;
        var account = this.instance.accountForCurrentUser();
        var instanceUsage = this.instance.usage();

        this.instance.activities().fetch();
        this.instance.accounts().fetch();

        account.fetchIfNotLoaded();
        this.requiredResources.reset();
        this.requiredResources.push(this.instance.accounts());
        this.requiredResources.push(account);

        var update = _.debounce(_.bind(function() {
            this.updateWorkspaceUsage();
        }, this), 100);

        this.bindings.removeAll();
        this.bindings.add(account, "change", this.render);
        this.bindings.add(account, "fetchFailed", this.render);
        this.bindings.add(this.resource, "change", this.render, this);
        this.bindings.add(instanceUsage, "loaded", update, this);
        this.bindings.add(instanceUsage, "fetchFailed", update, this);

        this.render();
    },

    postRender: function() {
        this._super("postRender");
        if (this.instance) {
            this.$("a.dialog").data("instance", this.instance);
            this.instance.usage().fetch();
        }
    },

    canEditPermissions: function() {
        return !this.resource.isHadoop() && this.canEditInstance();
    },

    canEditInstance: function() {
        return (this.resource.owner().get("id") == chorus.session.user().get("id") ) || chorus.session.user().get("admin");
    },

    updateWorkspaceUsage: function() {
        this.$(".workspace_usage_container").empty();
        if (this.model.hasWorkspaceUsageInfo()) {

            var el;
            var count = this.instance.usage().workspaceCount();
            if (count > 0) {
                el = $("<a class='dialog workspace_usage' href='#' data-dialog='InstanceUsage'></a>");
                el.data("instance", this.instance);
            } else {
                el = $("<span class='disabled workspace_usage'></span>");
            }
            el.text(t("instances.sidebar.usage", {count: count}));
            this.$(".workspace_usage_container").append(el);
        }
    }
});