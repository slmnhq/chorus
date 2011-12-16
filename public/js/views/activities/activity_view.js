;(function($, ns) {
    var types = [
        "NOTE",
        "DEFAULT",
        "WORKSPACE_CREATED",
        "WORKSPACE_DELETED",
        "MEMBERS_ADDED"
    ];

    var compiledTemplates = {};
    _.each(types, function(type) {
        compiledTemplates[type] = Handlebars.compile(t("activity_stream.header.html." + type));
    });

    ns.views.Activity = chorus.views.Base.extend({
        className : "activity",

        additionalContext : function() {
            var author = this.model.author();

            var comments = this.model.get("comments");
            var subComments = _.map(comments, function(comment) {
                comment = new chorus.models.Comment(comment)
                var user = comment.creator();
                var ctx = {
                    imageUrl : user.imageUrl({ size : "icon" }),
                    authorShowUrl : user.showUrl(),
                    displayName : user.displayName(),
                    timestamp : comment.get("timestamp"),
                    id : comment.get("id")
                };

                if (comment.get("text")) {
                    ctx.body = comment.get("text")
                }

                return ctx;
            });

            return {
                imageUrl : author.imageUrl(),
                showUrl : author.showUrl(),
                headerHtml : this.headerHtml(),
                body : this.model.get("text"),
                timestamp : this.model.get("timestamp"),
                subComments : subComments
            }
        },

        headerHtml : function() {
            var type = this.model.get("type");
            var template = compiledTemplates[type] || compiledTemplates['DEFAULT'];
            return template({
                type: type,
                authorUrl: this.model.author().showUrl(),
                authorName: this.model.author().displayName(),
                objectUrl: this.model.objectUrl(),
                objectName: this.model.objectName(),
                workspaceUrl: this.model.workspaceUrl(),
                workspaceName: this.model.workspaceName()
            });
        }
    });
})(jQuery, chorus);
