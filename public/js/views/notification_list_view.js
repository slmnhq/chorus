chorus.views.NotificationList = chorus.views.Base.extend({
    className: "notification_list",

    postRender: function() {
        var $list = this.$("ul");
        this.collection.each(function(model) {
            var view = new chorus.views.Activity({ model: model.activity(), isNotification: true });
            view.render();

            if (model.get("unread")) {
                $(view.el).addClass("unread");
            }

            $list.append(view.el);
        }, this);
    }
});
