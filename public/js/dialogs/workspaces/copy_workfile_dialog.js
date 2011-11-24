(function($, ns) {
    ns.CopyWorkfile = chorus.dialogs.Base.extend({
        className : "copy_workfile",
        title : t("workfile.copy_dialog.title"),

        persistent: true,

        events : {
        },

        makeModel : function() {
            this.collection = this.collection || new chorus.models.WorkspaceSet();
            this.collection.fetch();
        },

        setup : function() {
            this.picklistView = new chorus.views.CollectionPicklist({ collection : this.collection });
        },

        postRender : function() {
            this.picklistView.render();
            $(this.el).append(this.picklistView.el);
        }
    });
})(jQuery, chorus.dialogs);
