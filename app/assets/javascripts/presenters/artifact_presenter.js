chorus.presenters.Artifact = chorus.presenters.Base.extend({
    present: function(model, options) {
        var url = model.hasOwnPage() ? model.showUrl() : model.downloadUrl();
        var iconSize = (options && options.iconSize) || "medium";
        var result = {
            url: url,
            iconSrc: (model.isImage && model.isImage()) ? model.thumbnailUrl() : model.iconUrl({size: iconSize})
        }
        if(model.get("objectName")) {
            result.name = model.get("objectName");
        }
        return result
    }
});