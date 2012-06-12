chorus.views.InstanceListSidebar = chorus.views.Sidebar.extend({
    constructorName: "InstanceListSidebarView",
    templateName: "instance_list_sidebar",
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

        return {
            isGreenplum: this.model.isGreenplum(),
            isHadoop: this.model.isHadoop(),
            userHasAccount: this.model.accountForCurrentUser() && this.model.accountForCurrentUser().has("id"),
            userCanEditPermissions: this.canEditPermissions(),
            userCanEditInstance: this.canEditInstance(),
            instanceAccountsCount: this.instance.accounts().length,
            editable: !this.instance.isFault() && !this.instance.isProvisioning(),
            deleteable: this.instance.isFault() && this.instance.get("provision_type") == "create",
            isProvisioning: this.instance.isProvisioning(),
            isFault: this.instance.isFault(),
            isOnline: this.instance.isOnline(),
            instanceProvider: this.instance.isGreenplum() ? "Greenplum Database" : "Hadoop"
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

        this.resource.loaded = true;
        this.instance.activities().fetch();
        this.requiredResources.reset();
        this.bindings.removeAll();
        this.bindings.add(this.resource, "change", this.render, this);

        var instanceUsage = this.instance.usage();
        var account = this.instance.accountForCurrentUser();

        var update = _.debounce(_.bind(function() {
            this.updateWorkspaceUsage();
        }, this), 100);

        if(instanceUsage) {
            this.bindings.add(instanceUsage, "loaded", update, this);
            this.bindings.add(instanceUsage, "fetchFailed", update, this);
        }

        if(account) {
            this.instance.accounts().fetch();
            account.fetchIfNotLoaded();
            this.requiredResources.push(this.instance.accounts());
            this.requiredResources.push(account);
            this.bindings.add(account, "change", this.render);
            this.bindings.add(account, "fetchFailed", this.render);
        }

        this.render();
    },

    postRender: function() {
        this._super("postRender");
        if (this.instance) {
            this.$("a.dialog").data("instance", this.instance);
            if(this.instance.usage()) {
                this.instance.usage().fetch();
            }
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
