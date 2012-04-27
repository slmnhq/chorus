chorus.views.UserList = chorus.views.SelectableList.extend({
    templateName: "user/list",
    eventName: "user",

    collectionModelContext: function(model) {
        return {
            imageUrl: model.imageUrl({size: "icon"}),
            showUrl: model.showUrl(),
            fullName: model.displayName(),
            title: model.get("title")
        }
    }
});
