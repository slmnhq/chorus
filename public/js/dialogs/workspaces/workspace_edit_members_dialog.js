;
(function(ns) {
    ns.dialogs.WorkspaceEditMembers = ns.dialogs.Base.extend({
        className : "workspace_edit_members",
        title: t("workspace.edit_members.title"),
        persistent: true,

        events : {
            "click button.submit" : "updateMembers"
        },

        makeModel : function () {
            this.collection = new chorus.models.UserSet();
            this.collection.fetchAll();
            this.members = this.options.pageModel.members();
            this.members.fetch();
        },

        subviews: {
            ".shuttle": "shuttle"
        },

        setup : function() {
            this.shuttle = new ns.views.ShuttleWidget({
                collection : this.collection,
                selectionSource : this.members,
                nonRemovable : [this.options.pageModel.owner()],
                nonRemovableText : t("workspace.owner"),
                objectName : t("workspace.members")
            });
        },

        updateMembers : function() {
            var self = this;
            var ids = this.shuttle.getSelectedIDs();
            var users = _.map(ids, function(userId) {
                return self.collection.get(userId);
            });
            self.members.reset(users);
            self.members.save();
            self.closeModal();
        }
    });
})(chorus)
