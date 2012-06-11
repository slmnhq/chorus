chorus.presenters.Base = function(model, options) {
    this.model = model;
    this.options = options || {};
};

chorus.presenters.Base.extend = chorus.classExtend;

