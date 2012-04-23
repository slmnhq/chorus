chorus.presenters.Base = function (model, options) {
    var presentation = {
        serverErrors:model.serverErrors,
        loaded:model.loaded
    };

    return _.extend(presentation, model.attributes, this.present(model, options || {}));
};

chorus.presenters.Base.extend = chorus.classExtend;

_.extend(chorus.presenters.Base.prototype, {
    present: $.noop
})
