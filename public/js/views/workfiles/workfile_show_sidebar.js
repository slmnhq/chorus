(function($, ns) {
    ns.views.WorkfileShowSidebar = ns.views.Base.extend({
        className : "workfile_show_sidebar",

        setup : function() {
            this.collection = this.model.activities();
            this.collection.fetch();
            this.collection.bind("changed", this.render, this);
            this.activityList = new ns.views.ActivityList({ collection : this.collection, activityType : t("workfile.content_details.activity"), additionalClass : "sidebar" });
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
