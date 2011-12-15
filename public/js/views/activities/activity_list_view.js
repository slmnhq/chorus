(function($, ns) {
    ns.views.ActivityList = ns.views.Base.extend({
        className : "activity_list",

        events : {
            "click .morelinks a.more,.morelinks a.less" : "toggleCommentList",
            "click .more_activities a" : "fetchMoreActivities"
        },

        toggleCommentList : function(event) {
            event.preventDefault();
            $(event.target).closest(".comments").toggleClass("more")
        },

        fetchMoreActivities : function(ev) {
            ev.preventDefault();
            var pageToFetch = parseInt(this.collection.pagination.page) + 1;
            this.collection.fetchPage(pageToFetch, { add: true });
        },

        additionalContext : function() {
            var ctx =  {
                activityType: this.options.activityType
            };

            if (this.collection.loaded) {
                var page = parseInt(this.collection.pagination.page);
                var total = parseInt(this.collection.pagination.total);
                ctx.showMoreLink = total > page;
            }

            return ctx;
        },

        postRender : function() {
            var el = this.$("ul");
            this.collection.each(function(model) {
                var view = new ns.views.Activity({model: model});
                view.render();
                el.append($("<li data-activity-id='" + model.get("id") + "'></li>").append(view.el));
                view.delegateEvents();
            });
        }
    });
})(jQuery, chorus);

