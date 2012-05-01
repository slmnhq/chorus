chorus.collections.UserSet = chorus.collections.Base.extend({
    constructorName: "UserSet",
    model:chorus.models.User,
    urlTemplate:"users/"
});