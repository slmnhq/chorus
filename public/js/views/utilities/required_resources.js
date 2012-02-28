chorus.RequiredResources = chorus.collections.Base.extend({
    constructorName: "RequiredResources",

    allLoaded:function () {
        return _.all(this.models, function (resource) {
            return resource.loaded;
        });
    },

    _add:function (obj) {
        this._super('_add', [obj, {silent:true}]);
        this.trigger('add', obj);
    },

    _prepareModel:function (obj) {
        return obj;
    }
});

chorus.RequiredResources.prototype.push = chorus.RequiredResources.prototype.add;
