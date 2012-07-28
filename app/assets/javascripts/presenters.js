chorus.presenters.Base = function(model, options) {
    this.resource = this.model = model;
    this.options = options || {};

    this.setup && this.setup();
};

chorus.presenters.Base.extend = chorus.classExtend;

