chorus.views.SearchHdfsList = chorus.views.SearchResultListBase.extend({
    constructorName: "SearchHdfsListView",
    className: "search_hdfs_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model) {
        var pathLinks = _.map(model.pathSegments(), function(entry) {
            return chorus.helpers.linkTo(entry.showUrl(), entry.get('name'));
        });
        var instance = model.getInstance();

        return {
            showUrl: model.showUrl(),
            humanSize: I18n.toHumanSize(model.get("size")),
            iconUrl: chorus.urlHelpers.fileIconUrl(_.last(model.get("name").split("."))),
            instanceLink: chorus.helpers.linkTo(instance.showUrl(), instance.get('name')),
            completePath: pathLinks.join(" / ")
        }
    },

    postRender: function() {
        var models = this.collection.models;
        for (var i = 0; i < models.length; i++) {
            var comments = models[i].get("comments");

            if (comments && comments.length > 0) {
                var view = new chorus.views.SearchResultCommentList({comments: comments});
                view.render();

                this.$("li").eq(i).find(".comments_container").append(view.el);
            }
        }
    }
});