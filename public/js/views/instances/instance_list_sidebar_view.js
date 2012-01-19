;
(function($, ns) {
    ns.views.InstanceListSidebar = chorus.views.Sidebar.extend({

        className : "instance_list_sidebar",

        subviews : {
            '.activity_list' : 'activityList',
            '.tab_control' : 'tabControl'
        },

        setup : function() {
            this.bind("instance:selected", this.setInstance, this);
            this.tabControl = new chorus.views.TabControl([{name: 'activity', selector: ".activity_list"}, {name: 'configuration', selector: ".configuration_detail"}]);
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

        setInstance : function(instance) {
            this.resource = this.instance = this.model = instance;
            this.instance.activities().fetch();
            if(!this.instance.loaded) {
                this.instance.fetch();
            }

            this.instance.accounts().fetch();
            this.instance.accounts().bind("reset", this.render, this);

            this.resource.bind("change", this.render, this);

            var account = this.instance.accountForCurrentUser();
            account.bind("change", this.render, this);
            account.bind("fetchFailed", this.render, this);
            account.fetch();

            this.render();
        },

        canEditInstance : function() {
            return (this.resource.owner().get("id") == chorus.session.user().get("id") ) || chorus.session.user().get("admin");
        }
    });
})(jQuery, chorus);
