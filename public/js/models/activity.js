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
