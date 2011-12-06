(function($, ns) {
    ns.views.WorkfileShowSidebar = ns.views.Base.extend({
        className : "workfile_show_sidebar",

        setup : function() {
            this.collection = new ns.models.ActivitySet([], { entityType : "workfile", entityId : this.model.get("id") });
            this.collection.fetch();
            this.model.bind("invalidated", this.collection.fetch, this.collection);
            this.collection.bind("changed", this.render, this);
            this.activityList = new ns.views.ActivityList({ collection : this.collection });
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
})(jQuery, chorus);
