;
(function(ns) {
    ns.dialogs.WorkspaceEditMembers = ns.dialogs.Base.extend({
        className : "workspace_edit_members",
        title: t("workspace.edit_members.title"),

        events : {
            "click button.submit" : "updateMembers"
        },

        makeModel : function () {
            this.collection = new chorus.models.UserSet();
            this.collection.fetchAll();
            this.selectedIDs = [];
        },

        setup : function() {
            this.workspaceID = this.options.pageModel.get("id");
            this.shuttle = new ns.views.ShuttleWidget({
                collection : this.collection,
                selectedIDs : this.selectedIDs
            });
        },

        postRender : function() {
            this.$(".shuttle").html(this.shuttle.render().el);
            this.shuttle.delegateEvents();
        },

        updateMembers : function() {

        }
    });
})(chorus)