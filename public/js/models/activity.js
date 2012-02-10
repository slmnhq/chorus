chorus.models.Activity = chorus.models.Base.extend({
    author:function () {
        this._author = this._author || new chorus.models.User(this.get("author"));
        return this._author;
    },

    comments:function () {
        this._comments || (this._comments = new chorus.collections.CommentSet(this.get("comments")));
        return this._comments;
    },

    instance:function () {
        if (this.get("instance")) {
            this._instance || (this._instance = new chorus.models.Instance(this.get("instance")));
        }

        return this._instance;
    },

    workspace:function () {
        if (this.get("workspace")) {
            this._workspace || (this._workspace = new chorus.models.Workspace(this.get("workspace")));
        }

        return this._workspace;
    },

    dataset: function() {
        var datasetField = this.get("table") || this.get("view") || this.get("chorusView") || this.get("databaseObject");
        if (datasetField && this.get("workspace")) {
            return new chorus.models.Dataset({
                id:   datasetField.id,
                type: datasetField.type,
                objectType: datasetField.objectType,
                objectName: datasetField.name,
                workspace: this.get("workspace")
            });
        }
    },

    databaseObject: function() {
        var databaseObjectField = this.get("databaseObject");
        if (databaseObjectField) {
            return new chorus.models.DatabaseObject({
                id: databaseObjectField.id,
                type: databaseObjectField.type,
                objectType: databaseObjectField.objectType,
                objectName: databaseObjectField.name
            });
        }
    },

    workfile:function () {
        if (this.get("workfile")) {
            if (!this._workfile) {
                this._workfile = new chorus.models.Workfile(this.get("workfile"));
                this._workfile.set({workfileId:this._workfile.get("id")})
                if (this.get("version")) {
                    this._workfile.set({versionNum:this.get("version")})
                }

                if (this.workspace() && this.workspace().get("id")) {
                    this._workfile.set({ workspaceId:this.workspace().get("id") });
                }
            }
        }

        return this._workfile;
    },

    attachments:function () {
        if (!this._attachments) {
            this._attachments = _.map(this.get("artifacts"), function (artifactJson) {
                var klass = (artifactJson.entityType == "workfile") ? chorus.models.Workfile : chorus.models.Artifact;
                return new klass(artifactJson);
            });
        }
        return this._attachments;
    },

    noteworthy: function() {
        return this.instance() || this.workfile() || this.dataset() || this.databaseObject() || this.workspace();
    }
});
