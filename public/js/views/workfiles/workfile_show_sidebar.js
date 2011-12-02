(function($, ns) {
    ns.WorkfileShowSidebar = chorus.views.Base.extend({
        className : "workfile_show_sidebar",

        setup : function() {
            this.activityList = new ns.ActivityList({ collection : ns.ActivityList.cannedActivitySetFor(this.model) });
        },

        additionalContext : function(ctx) {
            return {
                updatedBy : [this.model.get("modifiedByFirstName"), this.model.get("modifiedByLastName")].join(' '),
                modifierUrl : this.model.modifier().showUrl()
            }
        },

        postRender : function() {
            this.activityList.el = this.$(".activities")
            this.activityList.delegateEvents()
            this.activityList.render();
        }
    });
})(jQuery, chorus.views);
