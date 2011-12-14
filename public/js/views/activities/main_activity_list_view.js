(function($, ns) {
    ns.views.MainActivityList = ns.views.Base.extend({
        className : "main_activity_list",

        additionalContext : function() {
            return {
                activityType: this.options.activityType
            }
        },

        postRender : function() {
            var el = this.$("ul");
            this.collection.each(function(model) {
                var view = new ns.views.Activity({model: model});
                view.render();
                el.append($("<li></li>").append(view.el));
                view.delegateEvents();
            });
        }
    });
})(jQuery, chorus);

