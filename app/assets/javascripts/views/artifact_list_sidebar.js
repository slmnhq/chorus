chorus.views.ArtifactListSidebar = chorus.views.Sidebar.extend({
    templateName:"artifact_list_sidebar",

    setArtifact:function (artifact) {
        this.model = this.artifact = artifact;
    },

    additionalContext:function () {
        return {
            downloadUrl: this.artifact.downloadUrl(),
            iconUrl: this.artifact.iconUrl(),
            name: this.artifact.get('name')
        };
    }
});
