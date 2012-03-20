chorus.models.Artifact = chorus.models.Base.extend({
    constructorName: "Artifact",

    iconUrl: function(options) {
        return chorus.urlHelpers.fileIconUrl(this.get("type") || this.get("fileType"), options && options.size);
    },

    downloadUrl:function () {
        return "/edc/file/" + this.get("id");
    },

    workspace: function() {
        if(!this._workspace) {
            this._workspace = this.get('workspace')&& !_.isEmpty(this.get('workspace')) && new chorus.models.Workspace(this.get('workspace'));
        }
        return this._workspace;
    },

    tabularData: function() {
        if(!this._tabularData) {
            if(this.get("databaseObject")) {
                if(_.isEmpty(this.get("workspace"))) {
                    this._tabularData = new chorus.models.DatabaseObject(this.get('databaseObject'));
                } else {
                    this._tabularData = new chorus.models.Dataset(this.get('databaseObject'));
                    this._tabularData.set({ workspace: this.get('workspace') });
                }
            }
        }
        return this._tabularData;
    }
});