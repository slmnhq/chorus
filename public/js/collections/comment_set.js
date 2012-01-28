chorus.collections.CommentSet = chorus.collections.Base.extend({
    model:chorus.models.Comment,
    urlTemplate:"comment/workspace/{{workspaceId}}"
});