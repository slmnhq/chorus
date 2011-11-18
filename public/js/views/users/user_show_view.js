;(function($, ns) {
    ns.UserShow = chorus.views.Base.extend({
        className: "user_show",

        additionalContext: function(){
            if (!this._fetchedWorkspaces) {
                this.model.getWorkspaces().fetch();
                this._fetchedWorkspaces = true;
            }

            return {
                workspaces: this.model.getWorkspaces(),
                department: this.model.get("ou")
            }
        }
    });
})(jQuery, chorus.views);
