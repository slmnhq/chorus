;(function(ns) {
    ns.RequiredResources = ns.collections.Base.extend({
        allLoaded: function() {
            return _.all(this.models, function(resource) {
                return resource.loaded;
            });
        },

        _add: function(obj) {
            this._super('_add', [obj, {silent: true}]);
            this.trigger('add', obj);
        },

        _prepareModel: function(obj) {
            return obj;
        }
    });

    ns.RequiredResources.prototype.push = ns.RequiredResources.prototype.add;
})(chorus);
