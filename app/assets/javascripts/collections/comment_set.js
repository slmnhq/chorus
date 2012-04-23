chorus.collections.CommentSet = chorus.collections.Base.extend({
    constructorName: "CommentSet",
    model:chorus.models.Comment,
    urlTemplate:"comment/workspace/{{workspaceId}}"
});