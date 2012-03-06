chorus.models.Activity = chorus.models.Base.extend({
    constructorName: "Activity",

    author: function() {
        if (!this._author && this.has("author")) {
            this._author = new chorus.models.User(this.get("author"))
        }
        
        return this._author;
    },

    comments: function() {
        this._comments || (this._comments = new chorus.collections.CommentSet(
            this.get("comments"), {
                entityType: this.collection && this.collection.attributes.entityType,
                entityId: this.collection && this.collection.attributes.entityId
            }
        ));
        return this._comments;
    },

    instance: function() {
        if (this.get("instance")) {
            this._instance || (this._instance = new chorus.models.Instance(this.get("instance")));
        }

        return this._instance;
    },

    workspace: function() {
        if (this.get("workspace")) {
            this._workspace || (this._workspace = new chorus.models.Workspace(this.get("workspace")));
        }

        return this._workspace;
    },

    dataset: function() {
        var datasetField = this.get("table") || this.get("view") || this.get("chorusView") || this.get("databaseObject");
        if (datasetField && this.get("workspace")) {
            return new chorus.models.Dataset({
                id: datasetField.id,
                type: datasetField.type,
                objectType: datasetField.objectType,
                objectName: datasetField.name,
                workspace: this.get("workspace")
            });
        }
    },

    sourceDataset: function() {
        var sourceObject = this.get("sourceObject")
        return new chorus.models.Dataset({
            id: sourceObject.id,
            objectName: sourceObject.name,
            workspace: this.get('workspace')
        })
    },

    databaseObject: function() {
        var databaseObjectField = this.get("databaseObject");
        if (databaseObjectField) {
            var attrs = _.clone(databaseObjectField)
            attrs.objectName = attrs.objectName || attrs.name;
            attrs.workspace = this.get('workspace');
            delete attrs.name;
            return new chorus.models.DatabaseObject(attrs);
        }
    },

    workfile: function() {
        if (this.get("workfile")) {
            if (!this._workfile) {
                this._workfile = new chorus.models.Workfile(this.get("workfile"));
                this._workfile.set({workfileId: this._workfile.get("id")})
                if (this.get("version")) {
                    this._workfile.set({versionNum: this.get("version")})
                }

                if (this.workspace() && this.workspace().get("id")) {
                    this._workfile.set({ workspaceId: this.workspace().get("id") });
                }
            }
        }

        return this._workfile;
    },

    hdfs: function() {
        var hdfsJson = this.get("hdfs");
        if (hdfsJson) {
            var attrs = _.clone(hdfsJson);
            attrs.entityId = attrs.id;
            attrs.fullName = attrs.name;
            attrs.name = _.last(attrs.fullName.split("/"));
            attrs.instanceId = _.first(attrs.id.split("|"));
            return new chorus.models.HdfsDirectoryEntry(attrs);
        }
    },

    promoteToInsight: function(options) {
        var insight = new chorus.models.CommentInsight({
            id: this.get("id"),
            action: "promote"
        });
        insight.bind("saved", function() {
            this.collection.fetch();
            if (options && options.success) {
                options.success(this);
            }
        }, this);

        insight.save(null, { method: "create" });
    },

    publish: function() {
        var insight = new chorus.models.CommentInsight({
            id: this.get("id"),
            action: "publish"
        });

        insight.bind("saved", function() {
            this.collection.fetch();
        }, this);

        insight.save(null, { method: "create" });
    },

    unpublish: function() {
        var insight = new chorus.models.CommentInsight({
            id: this.get("id"),
            action: "unpublish"
        });

        insight.bind("saved", function() {
            this.collection.fetch();
        }, this);

        insight.save(null, { method: "create" });
    },

    attachments: function() {
        if (!this._attachments) {
            this._attachments = _.map(this.get("artifacts"), function(artifactJson) {
                var klass;
                switch (artifactJson.entityType) {
                    case 'workfile':
                        klass = chorus.models.Workfile;
                        break;
                    case 'chorusView':
                    case 'databaseObject':
                        klass = chorus.models.Dataset;
                        break;
                    default:
                        klass = chorus.models.Artifact;
                        break;
                }
                return new klass(artifactJson);
            });
        }
        return this._attachments;
    },

    isNote: function() {
        return this.get("type") === "NOTE";
    },

    isPublished: function() {
        return this.get("isPublished") === true;
    },

    noteworthy: function() {
        return this.instance() ||
            this.workfile() ||
            this.dataset() ||
            this.databaseObject() ||
            (this.has("user") && new chorus.models.User(this.get("user")[0])) ||
            this.workspace() ||
            this.hdfs();
    }
});
