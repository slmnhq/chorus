;(function(ns) {
    ns.models.Activity = ns.models.Base.extend({
        author : function() {
            this._author = this._author || new ns.models.User(this.get("author"));
            return this._author;
        },

        comments: function() {
            this._comments || (this._comments = new ns.collections.CommentSet(this.get("comments")));
            return this._comments;
        },

        instance: function() {
            if (this.get("instance")) {
                this._instance || (this._instance = new ns.models.Instance(this.get("instance")));
            }

            return this._instance;
        },

        workspace: function() {
            if (this.get("workspace")) {
                this._workspace || (this._workspace = new ns.models.Workspace(this.get("workspace")));
            }

            return this._workspace;
        },

        workfile: function() {
            if (this.get("workfile")) {
                if (!this._workfile) {
                    this._workfile = new ns.models.Workfile(this.get("workfile"));
                    this._workfile.set({workfileId : this._workfile.get("id")})
                    if (this.get("version")) {
                        this._workfile.set({versionNum: this.get("version")})
                    }

                    if (this.workspace() && this.workspace().get("id")) {
                        this._workfile.set({ workspaceId : this.workspace().get("id") });
                    }
                }
            }

            return this._workfile;
        },

        attachments: function() {
            if (!this._attachments) {
                this._attachments = _.map(this.get("artifacts"), function(artifactJson) {
                    var klass = (artifactJson.entityType == "workfile") ? ns.models.Workfile : ns.models.Artifact;
                    return new klass(artifactJson);
                });
            }
            return this._attachments;
        }
    });
})(chorus);
