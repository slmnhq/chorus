chorus.views.ActivityList = chorus.views.Base.extend({
    constructorName: "ActivityListView",
    className:"activity_list",
    useLoadingSection:true,

    events:{
        "click .morelinks a.more,.morelinks a.less":"toggleCommentList",
        "click .more_activities a":"fetchMoreActivities"
    },

    toggleCommentList:function (event) {
        event.preventDefault();
        $(event.target).closest(".comments").toggleClass("more")
        this.trigger("content:changed")
    },

    fetchMoreActivities:function (ev) {
        ev.preventDefault();
        var pageToFetch = parseInt(this.collection.pagination.page) + 1;
        this.collection.fetchPage(pageToFetch, { add: true, success: _.bind(this.render, this) });
    },

    additionalContext:function () {
        var ctx = { activityType: this.options.type };
        if (this.collection.loaded && this.collection.pagination) {
            var page = parseInt(this.collection.pagination.page);
            var total = parseInt(this.collection.pagination.total);

            if (this.collection.pagination.total != -1) {
                ctx.showMoreLink = total > page;
            } else {
                var maxSize = this.collection.attributes.pageSize * page;
                ctx.showMoreLink = this.collection.length == maxSize;
            }
        } else {
            ctx.showMoreLink = false;
        }
        return ctx;
    },

    postRender:function () {
        $(this.el).addClass(this.options.additionalClass);
        var ul = this.$("ul");
        this.activities = [];
        this.collection.each(function(model) {
            try {
                var view = new chorus.views.Activity({
                    model:model,
                    displayStyle: this.options.displayStyle,
                    isNotification: this.options.isNotification,
                    isReadOnly: this.options.isReadOnly
                });
                this.activities.push(view);
                ul.append(view.render().el);
            } catch (err) {
                chorus.log(err);
            }
        }, this);
    },

    show: function() {
        _.each(this.activities, function(activity) {
            activity.show();
        });
    }
});
