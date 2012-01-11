;(function($, ns) {
    ns.views.LoadingSection = ns.views.Base.extend({
        className : "loading_section",

        postRender : function() {
            if (this.options.delay) {
                _.delay(_.bind(this.showSpinner, this), this.options.delay);
            } else {
                this.showSpinner();
            }
        },

        showSpinner : function() {
            this.$('.loading_spinner').startLoading();
            this.$(".loading_text").removeClass("hidden");
        }
    })
})(jQuery, chorus);
