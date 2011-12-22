;
(function($, ns) {
    ns.views.InstanceListSidebar = chorus.views.Base.extend({

        className : "instance_list_sidebar",

        subviews : {
            '.activity_list' : 'activityList'
        },

        setup : function() {
            this.bind("instance:selected", this.setInstance, this);
        },

        activityList : function() {
            if(this.instance) {
                return new chorus.views.ActivityList({collection: this.model.activities()});
            }
        },

        setInstance : function(instance) {
            this.resource = this.instance = this.model = instance;
            this.instance.activities().fetch()
            this.render();
        }

    });
})(jQuery, chorus);