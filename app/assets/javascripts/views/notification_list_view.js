chorus.views.NotificationList = chorus.views.Base.extend({
    constructorName: "NotificationListView",
    templateName: "notification_list",
    useLoadingSection: true,

    events: {
        "click .more_notifications a":"fetchMoreNotifications"
    },

    setup: function() {
        this.activities = [];
    },

    fetchMoreNotifications: function (ev) {
        ev.preventDefault();
        var pageToFetch = parseInt(this.collection.pagination.page) + 1;
        this.collection.fetchPage(pageToFetch, { add: true, success: _.bind(this.render, this) });
        this.collection.bindOnce("loaded", function() {
            this.collection.markAllRead({});
        }, this);
    },

    additionalContext:function () {
        var ctx = {  };
        if (this.collection.loaded && this.collection.pagination) {
            var page = parseInt(this.collection.pagination.page);
            var total = parseInt(this.collection.pagination.total);
            ctx.showMoreLink = this.options.allowMoreLink && (total > page);
        } else {
            ctx.showMoreLink = false;
        }
        return ctx;
    },

    postRender: function() {
        var $list = this.$("ul");

        this.activities = [];
        this.collection.each(function(model) {
            try {
                var view = new chorus.views.Activity({
                    model: model.activity(),
                    isNotification: true,
                    isReadOnly: true
                });
                view.render();
                this.activities.push(view);

                if (model.get("unread")) {
                    $(view.el).addClass("unread");
                }

                $list.append(view.el);
            } catch (err) {
                chorus.log("error", err, "processing notification", model);
                //TODO remove this before shipping
                chorus.toast("bad_notification", {type: model.get("action"), id: model.id, toastOpts: {theme: "bad_activity"}});
            }
        }, this);
    },

    show: function() {
        _.each(this.activities, function(activity) {
            activity.show();
        })
    }
});
