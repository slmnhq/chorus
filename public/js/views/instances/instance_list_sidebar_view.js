;
(function($, ns) {
    ns.views.InstanceListSidebar = chorus.views.Sidebar.extend({

        className : "instance_list_sidebar",
        useLoadingSection: true,

        subviews : {
            '.activity_list' : 'activityList',
            '.tab_control' : 'tabControl'
        },

        setup : function() {
            this.bind("instance:selected", this.setInstance, this);
            this.instance = this.model;
            this.tabControl = new chorus.views.TabControl([{name: 'activity', selector: ".activity_list"}, {name: 'configuration', selector: ".configuration_detail"}]);
            if(this.instance) {
                this.fetchInstanceData();
            }
        },

        additionalContext : function() {
            if(!this.model) {
                return {};
            }
            var account = this.model.accountForCurrentUser();
            return {
                dbUserName : this.model.get('sharedAccount') && this.model.get('sharedAccount').dbUserName,
                userHasAccount: account && account.has("id"),
                userCanEditInstance : this.canEditInstance(),
                instanceAccountsCount : this.instance.accounts().length,
                deleteable : this.instance.get("state") == "fault" && this.instance.get("provisionType") == "create"
            };
        },

        activityList : function() {
            if(this.instance) {
                return new chorus.views.ActivityList({collection: this.model.activities(), displayStyle: 'without_object'});
            }
        },

        fetchInstanceData : function() {
            this.instance.activities().fetch();
            this.requiredResources.push(this.instance)
            if(!this.instance.loaded) {
                this.instance.fetch();
            }

            this.instance.accounts().fetch();
            this.requiredResources.push(this.instance.accounts())
            this.instance.accounts().bind("reset", this.render, this);

            var account = this.instance.accountForCurrentUser();
            this.requiredResources.push(account)
            account.bind("change", this.render, this);
            account.bind("fetchFailed", this.render, this);
            account.fetch();

            var instanceUsage = this.instance.usage();
            instanceUsage.fetch();
            this.requiredResources.push(instanceUsage)
        },

        canEditInstance : function() {
            return (this.resource.owner().get("id") == chorus.session.user().get("id") ) || chorus.session.user().get("admin");
        }
    });
})(jQuery, chorus);
