chorus.views.HdfsDirectoryEntryList = chorus.views.Base.extend({
    constructorName: "HdfsDirectoryEntryList",
    className: "hdfs_directory_entry_list",
    tagName: "ul",
    additionalClass: "list",

    events: {
        "click li": "selectItem"
    },

    collectionModelContext: function(model) {
        var instanceId = this.collection.attributes.instanceId;
        var path = this.collection.attributes.path;
        var url = "#/instances/" + instanceId + "/browse" + ( (path == "/") ? "" : path ) + "/" + model.get("name");
        return {
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: chorus.urlHelpers.fileIconUrl(_.last(model.get("name").split("."))),
            showUrl: url
        }
    },

    selectItem: function(e) {
        if ($(e.currentTarget).hasClass("selected")) {
            // don't repeatedly raise events for the same item
            // e.g. the user clicks the item to highlight text
            return;
        }

        this.$("li").removeClass("selected");
        $(e.currentTarget).addClass("selected");
        chorus.PageEvents.broadcast("hdfs_entry:selected", $(e.currentTarget).data("model"));
    },

    postRender: function() {
        this.collection.each(function(model, index) {
            this.$("li").eq(index).data("model", model);
        }, this);

        this.$("li:eq(0)").click();
    }
});