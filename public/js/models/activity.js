;(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        },

        comments: function(){
            this._comments || (this._comments = new chorus.models.CommentSet(this.get("comments")));
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

        workfile: function() {
            if (this.get("workfile")) {
                if (!this._workfile) {
                    this._workfile = new chorus.models.Workfile(this.get("workfile"));
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
                    var klass = (artifactJson.entityType == "workfile") ? ns.Workfile : ns.Artifact;
                    return new klass(artifactJson);
                });
            }
            return this._attachments;
        }
    });
})(chorus.models);
