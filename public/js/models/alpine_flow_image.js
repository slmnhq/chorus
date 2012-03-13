chorus.models.AlpineFlowImage = Backbone.Model.extend(_.extend({}, chorus.Mixins.Events, {
    url: function() {
        return "/AlpineIlluminator/main/flow.do?method=getFlowImage&flowFilePath=" + encodeURIComponent(this.get("workfileDiskPath"));
    },

    parse: function(resp, xhr) {
        this.loaded = true;
        if (resp !== '') {
            return {found: true, imageFilePath: '/alpine' + resp};
        } else {
            return {found: false}
        }
    },

    fetch: function(options) {
        var changeAnyway = function () {
            this.loaded = true;
            this.trigger('change')
        }
        return this._super('fetch', [_.extend({dataType: 'text', error: _.bind(changeAnyway, this)}, options)]);
    }
}));