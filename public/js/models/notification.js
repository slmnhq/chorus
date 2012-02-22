chorus.models.Notification = chorus.models.Base.extend({
    urlTemplate:"notification/{{id}}",

    activity: function() {
        var activity = new chorus.models.Activity(this.get("body"));
        // push type into activity until we are properly rendering system activity notifications
        if (!activity.has("type")) {
            activity.set({type : this.get("type")});
        }

        activity.set({notificationId : this.id});

        return activity;
    }
});
