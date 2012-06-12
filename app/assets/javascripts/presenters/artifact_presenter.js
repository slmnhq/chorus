chorus.presenters.Artifact = chorus.presenters.Base.extend({
    url: function() {
        return this.model.hasOwnPage() ? this.model.showUrl() : this.model.downloadUrl();
    },

    iconSrc: function() {
        var iconSize = this.options.iconSize || "medium";
        return this.model.iconUrl({size: iconSize});
    },

    name: function() {
        return this.model.get("objectName");
    }
});
