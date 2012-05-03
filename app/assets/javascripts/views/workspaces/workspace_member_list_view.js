chorus.views.WorkspaceMemberList = chorus.views.Base.extend({
    constructorName: "WorkspaceMemberList",
    templateName: "workspace_member_list",
    numMembers: 24,

    setup: function() {
        chorus.PageEvents.subscribe("workspace:selected", this.setWorkspace, this)
    },

    context: function() {
        if (this.model) {
            return {
                members: this.model.members().chain().first(this.numMembers).map(
                    function(member) {
                        return {
                            imageUrl: member.fetchImageUrl(),
                            showUrl: member.showUrl(),
                            displayName: member.displayName()
                        };
                    }).value(),
                extra_members: Math.max(this.model.members().length - this.numMembers, 0)
            }
        } else {
            return {}
        }
    },

    setWorkspace: function(workspace) {
        this.resource = this.model = workspace
        if (workspace) {
            workspace.members().fetchAllIfNotLoaded()
            workspace.members().onLoaded(this.render, this)
        }
        this.render()
    }
});
