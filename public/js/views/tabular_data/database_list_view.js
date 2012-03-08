chorus.views.DatabaseList = chorus.views.Base.extend({
    className: "database_list",
    additionalClass: "list",
    tagName: "ul",

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    }
});