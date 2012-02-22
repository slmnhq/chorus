chorus.models.Notification = chorus.models.Base.extend({
    urlTemplate:"notification/{{id}}",

    activity: function() {
        return new chorus.models.Activity(this.get("body"));
    }
});
