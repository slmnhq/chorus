;
(function(ns) {
    ns.models.WorkfileVersion = ns.models.Workfile.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{workfileId}}/version/{{versionId}}",

        initialize : function() {
            this.entityId = this.get("workfileId");
        },

        downloadUrl : function() {
            return "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("workfileId") + "/file/" + this.get("versionFileId") + "?download=true";
        },

        save : function() {
            // for now, no-op, but later, enable save when latestVersion == thisVersion
        },

        canEdit : function() {
            return false;
        }
    });
})(chorus);