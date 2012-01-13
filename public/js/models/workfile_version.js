;
(function(ns) {
    ns.models.WorkfileVersion = ns.models.Workfile.extend({
        urlTemplate : "workspace/{{workspaceId}}/workfile/{{workfileId}}/version/{{versionNum}}",
        showUrlTemplate : "workspaces/{{workspaceId}}/workfiles/{{workfileId}}/versions/{{versionNum}}",

        initialize : function() {
            this.entityId = this.get("workfileId");
        },

        createDraft : function() {
            if (this.canEdit()) {
                this._super("createDraft", arguments);
            }
        },

        downloadUrl : function() {
            return "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("workfileId") + "/file/" + this.get("versionFileId") + "?download=true";
        },

        save : function() {
            if (this.canEdit()) {
                // may use wrong url template???
                this._super("save", arguments);
            }
        },

        canEdit : function() {
            return this.get("latestVersionNum") == this.get("versionNum");
        },

        _workfileId: function() {
            return this.get("workfileId");
        }
    });
})(chorus);