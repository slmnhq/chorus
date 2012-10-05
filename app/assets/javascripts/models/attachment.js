chorus.models.Attachment = chorus.models.Base.extend({
    constructorName: "Attachment",

    name: function() {
        return this.attributes && this.attributes.name;
    },

    showUrl: function(){
        var workspaceUrl = this.workspace() && this.workspace().get('id') && this.workspace().showUrl();
        var datasetUrl = this.dataset() && this.dataset().showUrl();
        var workfileUrl = this.workfile() && this.workfile().showUrl();
        var hdfsFileUrl = this.hdfsFile() && this.hdfsFile().showUrl();
        var instanceUrl = this.instance() && this.instance().showUrl();
        var hadoopInstanceUrl = this.hadoopInstance() && this.hadoopInstance().showUrl();

        return datasetUrl ||
            (workspaceUrl && workfileUrl) ||
            hdfsFileUrl ||
            workspaceUrl ||
            instanceUrl ||
            hadoopInstanceUrl;
    },

    iconUrl: function(options) {
        if (this.get('iconUrl')) {
            return this.get('iconUrl');
        }
        return chorus.urlHelpers.fileIconUrl(this.get("type") || this.get("fileType"), options && options.size);
    },

    downloadUrl:function () {
        return "/attachments/" + this.get("id") + "/download/" ;
    },

    thumbnailUrl: function () {
        return "/file/" + (this.get("fileId") || this.get("id")) + "/thumbnail";
    },

    isImage: function() {
        return this.get("type") === "IMAGE" || this.get("fileType") === "IMAGE";
    },

    workspace: function() {
        if(!this._workspace) {
            if (this.workfile()) {
                this._workspace = this.workfile().workspace();
            } else {
                this._workspace = this.get('workspace')&& !_.isEmpty(this.get('workspace')) && new chorus.models.Workspace(this.get('workspace'));
            }
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
            this._hdfsFile = this.get('hdfsEntry') && new chorus.models.HdfsEntry(this.get('hdfsEntry'));
        }
        return this._hdfsFile;
    },

    instance: function() {
        if (!this._instance) {
            this._instance = this.get('gpdbInstance') && new chorus.models.GreenplumInstance(this.get('gpdbInstance'));
        }
        return this._instance;
    },

    hadoopInstance: function() {
        if (!this._hadoopInstance) {
            if (this.hdfsFile()) {
                this._hadoopInstance = this.hdfsFile().getHadoopInstance();
            } else {
                this._hadoopInstance = this.get('hadoopInstance') && new chorus.models.HadoopInstance(this.get('hadoopInstance'));
            }
        }
        return this._hadoopInstance;
    },

    dataset: function() {
        if(!this._dataset) {
            if(this.get("dataset")) {
                if(_.isEmpty(this.get("workspace"))) {
                    this._dataset = new chorus.models.Dataset(this.get('dataset'));
                } else {
                    this._dataset = new chorus.models.WorkspaceDataset(this.get('dataset'));
                    this._dataset.set({ workspace: this.get('workspace') });
                }
            }
        }
        return this._dataset;
    }
});