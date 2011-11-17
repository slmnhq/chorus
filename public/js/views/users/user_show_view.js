;(function($, ns) {
    ns.UserShow = chorus.views.Base.extend({
        className : "user_show",

        additionalContext : function(){
            var workspaces = this.model.getWorkspaces();
            if (!workspaces.loaded) workspaces.fetch();
            return {workspaces: workspaces}
        }
    });
})(jQuery, chorus.views);
