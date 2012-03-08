chorus.views.DatabaseList = chorus.views.Base.extend({
    className: "database_list",
    additionalClass: "list",
    tagName: "ul",

    events: {
        "click li": "selectItem"
    },

    selectItem: function(e) {
        var $target = $(e.currentTarget);
        if ($target.hasClass("selected")) {
            return;
        }

        var $lis = this.$("li");
        $lis.removeClass("selected");
        $target.addClass("selected");

        var index = $lis.index($target);
        chorus.PageEvents.broadcast("database:selected", this.collection.at(index));
    },

    collectionModelContext: function(model) {
        return {
            showUrl: model.showUrl()
        }
    },

    postRender: function() {
        this.$("li:eq(0)").click();
    }
});