; (function($, ns) {
    ns.Dashboard = chorus.views.Base.extend({
        className : "dashboard",
        postRender : function(el){
            this.headerView = (this.headerView || new ns.Header({ el : el.find("#header") })).render();
        }
    });
})(jQuery, chorus.views);