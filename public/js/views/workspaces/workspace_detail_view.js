(function($, ns) {
    ns.views.WorkspaceDetail = ns.views.Base.extend({
        className : "workspace_detail",

         setup : function() {
            this.collection = this.model.activities();
            this.collection.fetch();
            this.collection.bind("changed", this.render, this);
            this.activityList = new ns.views.SidebarActivityList({ collection : this.collection });
        },

        postRender : function() {
            this.activityList.el = this.$(".activities")
            this.activityList.delegateEvents()
            this.activityList.render();
        }
    });
})(jQuery, chorus);
