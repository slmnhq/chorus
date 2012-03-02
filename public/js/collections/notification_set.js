chorus.collections.NotificationSet = chorus.collections.Base.extend({
    constructorName: "NotificationSet",
    model: chorus.models.Notification,
    urlTemplate : "notification",

    urlParams: function () {
        return this.attributes;
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
        $.ajax({
            type: "PUT",
            url: "/edc/notification/" + this.pluck("id").join(",") + "/read"
        }).success(function(response) {
            if (response && response.status == "ok" && options.success) {
                options.success(response);
            }
        });
    }
})
