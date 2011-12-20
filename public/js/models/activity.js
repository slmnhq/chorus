;(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        },

        comments: function(){
            this._comments || (this._comments = new chorus.models.CommentSet(this.get("comments")));
            return this._comments;
        }
    });
})(chorus.models);
