chorus.views.SearchWorkspace = chorus.views.SearchItemBase.extend({
    constructorName: "SearchWorkspaceView",
    className: "search_workspace",
    eventType: "workspace",

    additionalContext: function(){
        return {
            showUrl: this.model.showUrl(),
            iconUrl: this.model.defaultIconUrl()
        }
    }
})
