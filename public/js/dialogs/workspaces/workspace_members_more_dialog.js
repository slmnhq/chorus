;
(function(ns) {
    ns.dialogs.WorkspaceMembersMore = ns.dialogs.Base.extend({
        className : "workspace_members_more",
        title : t("workspace.members"),

        setup : function() {
            this.members = this.pageModel.members();
        },

        additionalContext: function() {
            return {
                 members : this.members.map(function(member){
                     return {
                         displayName : member.displayName(),
                         imageUrl : member.imageUrl({size : 'icon'}),
                         showUrl : member.showUrl()
                     };
                })
            }
        }
    })
})(chorus)
