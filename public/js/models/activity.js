;(function(ns) {
    ns.Activity = chorus.models.Base.extend({

        initialize: function(attributes) {
            this._super('initialize', arguments);
            if(attributes.instance) {
                this.set({instance : new chorus.models.Instance(attributes.instance)});
            }
            if(attributes.workspace) {
                this.set({workspace : new chorus.models.Workspace(attributes.workspace)});
            }
            if(attributes.workfile) {
                attributes.workfile.workspaceId = this.get("workspace") && this.get('workspace').get('id');
                this.set({workfile : new chorus.models.Workfile(attributes.workfile)});
            }
        },

        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        },

        comments: function(){
            this._comments || (this._comments = new chorus.models.CommentSet(this.get("comments")));
            return this._comments;
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
