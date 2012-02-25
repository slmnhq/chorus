chorus.presenters.Artifact = chorus.presenters.Base.extend({
    present: function(model, options) {
        var url = model.hasOwnPage() ? model.showUrl() : model.downloadUrl();
        var iconSize = (options && options.iconSize) || "medium";
        return {
            url: url,
            iconSrc: model.iconUrl({size: iconSize})
        }
    }
});