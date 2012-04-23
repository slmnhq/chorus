chorus.models.Notification = chorus.models.Base.extend({
    constructorName: "Notification",
    urlTemplate:"notification/{{id}}",

    activity: function() {
        if (!this._activity) {
            this._activity = new chorus.models.Activity(this.attributes);
        }
        return this._activity;
    }
});
