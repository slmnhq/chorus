(function($, ns) {
    ns.UserListPage = chorus.views.Base.extend({
        className : "user_list_page",
        postRender : function(el) {
            this.headerView = (this.headerView || new ns.Header({ el : el.find("#header") })).render();

            var userSet = new chorus.models.UserSet();
            this.userSetView = (this.userSetView || new ns.UserSet({collection: userSet, el : el.find("#user_list") })).render();
            userSet.fetch();
        }
    });
})(jQuery, chorus.views);
