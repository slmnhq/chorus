chorus.collections.NotificationSet = chorus.collections.Base.extend({
    constructorName: "NotificationSet",
    model: chorus.models.Notification,
    urlTemplate : "notification",

    activities: function(){
        var models = this.map(function(model) {
            return model.activity();
        });

        var activities = new chorus.collections.ActivitySet(models)
        activities.loaded = true;
        return activities;
    }
})
