(function(ns) {
    ns.MemberSet = ns.Collection.extend({
        model : ns.User,
        urlTemplate : "workspace/{{workspaceId}}/member",

        save: function() {
            Backbone.sync('update', this, { data: this.toUrlParams() });
        },

        // this is a temporary hack because the api returns members
        // in an odd format, wrapped in an extra hash.
        parse: function(data) {
            var normalParse = this._super("parse", data);
            return normalParse[0] ? normalParse[0].members : []
        },

        toUrlParams: function() {
            return this.reduce(function(memo, model) {
                var param = "members=" + model.get("userName");
                return (memo.length === 0) ? param : (memo + "&" + param)
            }, "");
        }
    });
})(chorus.models);
