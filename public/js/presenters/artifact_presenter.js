;(function(ns) {
    ns.presenters.Artifact = ns.presenters.Base.extend({
        present: function(model) {
            if (model instanceof ns.models.Workfile && (model.isImage() || model.isText())) {
                return { showUrl: model.showUrl() };
            } else {
                return { showUrl: model.downloadUrl() };
            }
        }
    });
})(chorus);