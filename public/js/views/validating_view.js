;(function($, ns) {
    ns.views.Validating = ns.views.Base.extend({
        className : "validating",
        setup : function(options) {
            this.options = _.clone(options || {});
            this.childView = options.childView;
            this.resource = this.model = this.options.model;
        },

        postRender : function(){
            // feel free to add on to this and check an option to either append or prepend, if the child view
            // should be after the error div
            $(this.el).prepend(this.childView.render().el);

            this.childView.delegateEvents();
        }
    });
})(jQuery, chorus);