(function($, ns) {
    ns.CopyWorkfile = chorus.dialogs.Base.extend({
        className : "copy_workfile",
        title : t("workfile.copy_dialog.title"),

        persistent: true,

        makeModel : function() {
            this.collection = this.collection || new chorus.models.WorkspaceSet();
            this.collection.fetch();
        },

        setup : function() {
            this.picklistView = new chorus.views.CollectionPicklist({ collection : this.collection });
            this.picklistView.bind("item:selected", this.itemSelected, this);
        },

        postRender : function() {
            this.picklistView.render();
            this.$("#dialog_content .picklist").append(this.picklistView.el);
            this.picklistView.delegateEvents();
        },

        itemSelected : function(item) {
            if (item) {
                this.$("button.submit").removeAttr("disabled");
            }
            else {
                this.$("button.submit").attr("disabled", "disabled");
            }
        }
    });
})(jQuery, chorus.dialogs);
