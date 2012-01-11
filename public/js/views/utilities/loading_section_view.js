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
            var spinner = new Spinner({
              lines: 16, // The number of lines to draw
              length: 23, // The length of each line
              width: 5, // The line thickness
              radius: 25, // The radius of the inner circle
              color: '#000', // #rgb or #rrggbb
              speed: 1, // Rounds per second
              trail: 46, // Afterglow percentage
              shadow: false // Whether to render a shadow
            }).spin();
            this.$(".spinner").append(spinner.el);

            this.$(".description").removeClass("hidden");
        }
    })
})(jQuery, chorus);
