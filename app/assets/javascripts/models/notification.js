chorus.models.Notification = chorus.models.Base.extend({
    constructorName: "Notification",
    urlTemplate:"notification/{{id}}",

    activity: function() {
        if (!this._activity) {
            delete(this.attributes["event"]["id"]);
            delete(this.attributes["event"]["timestamp"]);
            var notification_attributes = $.extend(this.attributes, this.attributes["event"]);

            if (this.attributes["comment"])
                notification_attributes["body"] = this.attributes["comment"]["text"];

            this._activity = new chorus.models.Activity(notification_attributes);
        }
        return this._activity;
    }
});