;
(function($, ns) {
    ns.views.InstanceListSidebar = chorus.views.Base.extend({

        className : "instance_list_sidebar",

        subviews : {
            '.activity_list' : 'activityList',
            '.tab_control' : 'tabControl'
        },

        setup : function() {
            this.bind("instance:selected", this.setInstance, this);
            this.tabControl = new chorus.views.TabControl(['activity', 'configuration']);
            this.tabControl.bind("activity:selected", this.showActivityList, this)
            this.tabControl.bind("configuration:selected", this.showConfiguration, this);
        },

        additionalContext : function() {
            if(!this.model) {
                return {};
            }
            return {
                dbUserName : this.model.get('sharedAccount') && this.model.get('sharedAccount').dbUserName
            };
        },

        activityList : function() {
            if(this.instance) {
                return new chorus.views.ActivityList({collection: this.model.activities()});
            }
        },

        setInstance : function(instance) {
            this.resource = this.instance = this.model = instance;
            this.instance.activities().fetch();
            if(!this.instance.loaded) {
                this.instance.fetch();
            }
            this.resource.bind("change", this.render, this);
            this.render();
        },

        showActivityList : function(){
            toggleElement(".activity_list");
        },

        showConfiguration : function(){
            toggleElement(".configuration_detail");
        }
    })



    function toggleElement(selector) {
        var element = this.$(selector)
        element.siblings().hide();
        element.show()
    }
})(jQuery, chorus);