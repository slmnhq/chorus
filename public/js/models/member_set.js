(function(ns) {
    ns.MemberSet = ns.Collection.extend({
        model : ns.User,
        urlTemplate : "workspace/{{workspaceId}}/member",

        save: function() {
            Backbone.sync('update', this, { data: this.toUrlParams() });
        },

        toUrlParams: function() {
            return this.reduce(function(memo, model) {
                var param = "members=" + model.get("userName");
                return (memo.length === 0) ? param : (memo + "&" + param)
            }, "");
        }
    });
})(chorus.models);
