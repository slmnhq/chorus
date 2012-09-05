chorus.collections.NotificationSet = chorus.collections.Base.extend({
    constructorName: "NotificationSet",
    model: chorus.models.Notification,
    urlTemplate: "notifications",

    urlParams: function() {
        return this.attributes;
    },

    modelAdded: function(model) {
        if (this.attributes.type == "unread") {
            model.set({ unread: true }, { silent: true })
        }
    },

    activities: function() {
        var models = this.models.map(function(model) {
            return model.activity();
        });

        var activities = new chorus.collections.ActivitySet(models);
        activities.loaded = true;
        return activities;
    },

    markAllRead: function(options) {
        var self = this;
        if (this.length > 0) {
            $.ajax({
                type: "PUT",
                url: "/notifications/read",
                success: options.success,
                data: {
                    notification_ids: this.pluck("id")
                }
            });
        } else {
            options.success && options.success();
        }
    }
})
