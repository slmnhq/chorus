;(function(ns) {
    ns.presenters.Artifact = ns.presenters.Base.extend({
        present: function(model) {
            var modelHasOwnPage = model instanceof ns.models.Workfile && (model.isImage() || model.isText());
            var url = modelHasOwnPage ? model.showUrl() : model.downloadUrl();

            return {
                fileName: model.get("name"),
                url: url,
                iconSrc: chorus.urlHelpers.fileIconUrl(model.get("type"), 'medium')
            }
        }
    });
})(chorus);