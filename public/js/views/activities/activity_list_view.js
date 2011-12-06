(function($, ns) {
    ns.ActivityList = chorus.views.Base.extend({
        tagName : "ul",
        className : "activity_list",

        events : {
            "click .morelinks a.more,.morelinks a.less" : "toggleCommentList"
        },

        toggleCommentList : function(event) {
            event.preventDefault();
            $(event.target).closest("ul.comments").toggleClass("more")
        }
    });
})(jQuery, chorus.views);

