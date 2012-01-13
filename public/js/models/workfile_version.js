;
(function(ns) {
    ns.models.WorkfileVersion = ns.models.Workfile.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{workfileId}}/version/{{versionId}}",

        initialize : function() {
            this.set({
                fileName : "NeedFileNameFromApi.txt",
                mimeType : "text/plain",
                fileType : "txt"
            });
        },

        downloadUrl : function() {
            return "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("workfileId") + "/file/" + this.get("versionFileId") + "?download=true";
        },

        save : function() {
            // for now, no-op, but later, enable save when latestVersion == thisVersion
        }
    });
})(chorus);