chorus.views.UserList = chorus.views.SelectableList.extend({
    tagName:"ul",
    className:"user_list",
    additionalClass:"list",
    eventName: "user",

    collectionModelContext:function (model) {
        return {
            imageUrl:model.imageUrl({size:"icon"}),
            showUrl:model.showUrl(),
            fullName:[model.get("firstName"), model.get("lastName")].join(' '),
            title:model.get("title")
        }
    }
});
