chorus.models.Artifact = chorus.models.Base.extend({
    constructorName: "Artifact",

    name: function() {
        return this.attributes && this.attributes.name;
    },

    showUrl: function(){
        var workspaceUrl = this.workspace() && this.workspace().get('id') && this.workspace().showUrl();
        var tabularDataUrl = this.tabularData() && this.tabularData().showUrl();
        var workfileUrl = this.workfile() && this.workfile().showUrl();
        var hdfsFileUrl = this.hdfsFile() && this.hdfsFile().showUrl();
        var instanceUrl = this.instance() && this.instance().showUrl();
        var hadoopInstanceUrl = this.hadoopInstance() && this.hadoopInstance().showUrl();

        return tabularDataUrl ||
            (workspaceUrl && workfileUrl) ||
            hdfsFileUrl ||
            workspaceUrl ||
            instanceUrl ||
            hadoopInstanceUrl;
    },

    iconUrl: function(options) {
        return chorus.urlHelpers.fileIconUrl(this.get("type") || this.get("fileType"), options && options.size);
    },

    downloadUrl:function () {
        return "/file/" + (this.get("fileId") || this.get("id"));
    },

    thumbnailUrl: function () {
        return "/file/" + (this.get("fileId") || this.get("id")) + "/thumbnail";
    },

    isImage: function() {
        return this.get("type") === "IMAGE" || this.get("fileType") === "IMAGE";
    },

    workspace: function() {
        if(!this._workspace) {
            this._workspace = this.get('workspace')&& !_.isEmpty(this.get('workspace')) && new chorus.models.Workspace(this.get('workspace'));
        }
        return this._workspace;
    },

    workfile: function() {
        if(!this._workfile) {
            this._workfile = this.get('workfile') && new chorus.models.Workfile(this.get('workfile'));
        }
        return this._workfile;
    },

    hdfsFile: function() {
        if(!this._hdfsFile) {
            this._hdfsFile = this.get('hdfs') && new chorus.models.HdfsFile(this.get('hdfs'));
        }
        return this._hdfsFile;
    },

    instance: function() {
        if (!this._instance) {
            this._instance = this.get('instance') && new chorus.models.Instance(this.get('instance'));
        }
        return this._instance;
    },

    hadoopInstance: function() {
        if (!this._hadoopInstance) {
            this._hadoopInstance = this.get('hadoopInstance') && new chorus.models.HadoopInstance(this.get('hadoopInstance'));
        }
        return this._instance;
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