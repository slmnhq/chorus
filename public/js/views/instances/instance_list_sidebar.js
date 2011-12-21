;(function($, ns) {
    ns.views.InstanceListSidebar = chorus.views.Base.extend({

         className : "instance_list_sidebar",

         setup : function() {
            this.bind("instance:selected", this.setInstance, this);
         },

         setInstance : function(instance) {
             this.instance = instance;
             this.render();
         },

         additionalContext : function() {
             var ctx = {};

             if(this.instance) {
                ctx.instance = _.extend({}, this.instance.attributes);
             }

             return ctx;
         }
    });
})(jQuery, chorus);