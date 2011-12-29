;(function(ns) {
    ns.presenters.Artifact = ns.presenters.Base.extend({
        present: function(model, options) {
            var modelHasOwnPage = model instanceof ns.models.Workfile && (model.isImage() || model.isText());
            var url = modelHasOwnPage ? model.showUrl() : model.downloadUrl();

            return {
                url: url,
                iconSrc: chorus.urlHelpers.fileIconUrl(model.get("type") || model.get("fileType"), options.iconSize || 'medium')
            }
        }
    });
})(chorus);