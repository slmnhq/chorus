;(function(ns) {
    ns.presenters.Base = function(model) {
        var presentation = {
            serverErrors : model.serverErrors,
            loaded : model.loaded
        };

        return _.extend(presentation, model.attributes, this.present(model));
    }

    ns.presenters.Base.extend = Backbone.Model.extend;

    _.extend(ns.presenters.Base.prototype, {
        present : $.noop
    })
})(chorus);