chorus.models.Instance = chorus.models.Base.extend({
    _imagePrefix: "/images/instances/",

    _stateIconMap: {
        "online": "green.png",
        "offline": "yellow.png"
    },

    isProvisioning: function() {
        return this.get("state") == "provisioning";
    },

    isFault: function() {
        return this.get("state") == "offline";
    },

    isOnline: function() {
        return this.get("state") == "online";
    },

    stateText: function() {
        return t("instances.state." + (this.get("state") || "unknown"));
    },

    version: function() {
        return this.get("version");
    },

    stateIconUrl: function() {
        var filename = this._stateIconMap[this.get("state")] || "yellow.png";
        return this._imagePrefix + filename;
    },

    owner: function() {
        return new chorus.models.User(
            this.get("owner")
        )
    },

    isOwner: function(user) {
        return this.owner().get("id") == user.get('id') && user instanceof chorus.models.User
    }
})
