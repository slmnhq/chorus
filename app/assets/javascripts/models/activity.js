;(function() {
    var CLASS_MAP = {
        "actor": "User",
        "dataset": "WorkspaceDataset",
        "greenplumInstance": "GreenplumInstance",
        "newOwner": "User",
        "hadoopInstance": "HadoopInstance",
        "workfile": "Workfile",
        "workspace": "Workspace",
        "newUser" : "User",
        "noteObject" : "NoteObject",
        "hdfsEntry" : "HdfsEntry"
    };

    chorus.models.Activity = chorus.models.Base.extend({
        constructorName: "Activity",

        author: function() {
            if (!this._author && this.has("author")) {
                this._author = new chorus.models.User(this.get("author"))
            }

            return this._author;
        },

        newOwner: makeAssociationMethod("newOwner"),
        workspace: makeAssociationMethod("workspace"),
        actor: makeAssociationMethod("actor"),
        greenplumInstance: makeAssociationMethod("greenplumInstance"),
        hadoopInstance: makeAssociationMethod("hadoopInstance"),
        workfile: makeAssociationMethod("workfile"),
        newUser: makeAssociationMethod("newUser"),

        dataset: makeAssociationMethod("dataset", function(model) {
           model.set({workspace: this.get("workspace")}, {silent: true});
        }),

        hdfsEntry: makeAssociationMethod("hdfsEntry", function(model) {
            var hdfsFile = this.get("hdfsFile");
            var pathArray = hdfsFile.path.split("/");
            var path = _.first(pathArray, pathArray.length - 1).join('/');
            var name = _.last(pathArray);
            model.set({
                hadoopInstance: { id : hdfsFile.hadoopInstanceId},
                path : path,
                name : name
            })
        }),

        noteObject: function() {
            var model;

            switch (this.get("actionType")) {
                case "NOTE_ON_HADOOP_INSTANCE":
                    model = new chorus.models.HadoopInstance();
                    model.set(this.get("hadoopInstance"));
                    break;
                case "NOTE_ON_GREENPLUM_INSTANCE":
                    model = new chorus.models.GreenplumInstance();
                    model.set(this.get("greenplumInstance"));
                    break;
                case "NOTE_ON_HDFS_FILE":
                    model = new chorus.models.HdfsFile();
                    model.set({
                        hadoopInstance: new chorus.models.HadoopInstance({ id: this.get("hdfsFile").hadoopInstanceId }),
                        path: this.get("hdfsFile").path
                    });
                    break;
            }
            return model;
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

        parentComment: function() {
            if (this.get("parentComment")) {
                this._parentComment || (this._parentComment = new chorus.models.Activity(this.get("parentComment")));
            }

            return this._parentComment;
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

        toNote: function() {
            var comment = new chorus.models.Note({
                id: this.id,
                body: this.get("body")
            });

            comment.bind("saved", function() {
                this.collection.fetch();
            }, this);

            return comment;
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
                        case 'dataset':
                            klass = chorus.models.WorkspaceDataset;
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
            return this.get("action") === "NOTE";
        },

        isInsight: function() {
            return this.get("type") === "INSIGHT_CREATED";
        },

        isSubComment: function() {
            return this.get("type") === "SUB_COMMENT";
        },

        isUserGenerated: function () {
            return this.isNote() || this.isInsight() || this.isSubComment();
        },

        isPublished: function() {
            return this.get("isPublished") === true;
        },
        isOwner: function() {
            return (this.get("actor").id === chorus.session.user().id);
        }
    });

    function makeAssociationMethod(name, setupFunction) {
        return function() {
            var className = CLASS_MAP[name];
            var modelClass = chorus.models[className];
            var model = new modelClass(this.get(name));
            if (setupFunction) setupFunction.call(this, model);
            return model;
        };
    }
})();
