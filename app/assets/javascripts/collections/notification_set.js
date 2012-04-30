chorus.collections.NotificationSet = chorus.collections.Base.extend({
    constructorName: "NotificationSet",
    model: chorus.models.Notification,
    urlTemplate: "notification",

    urlParams: function() {
        return this.attributes;
    },

    _add: function(model) {
        var result = this._super('_add', arguments);
        if (this.attributes && this.attributes.type == "unread") {
            result.set({ unread: true }, { silent: true })
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
                url: "/notification/" + this.pluck("id").join(",") + "/read",
                success: options.success
            });
        } else {
            options.success && options.success();
        }
    }
})
