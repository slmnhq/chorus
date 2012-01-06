;
(function(ns) {
    ns.views.Sidebar = ns.views.Base.extend({
        postRender: function() {
            this._super('postRender');

            var sidebar = $(this.el).closest("#sidebar")
            sidebar.removeAttr("style")
            this.setupSidebarScrolling();

            var resizeTimer;

            // avoid rapid-fire resize events
            //
            $(window).resize(_.bind(function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(_.bind(function() {
                    this.setupSidebarScrolling();
                }, this), 100);
            }, this));
        },

        setupSidebarScrolling : function() {
            var sidebar = $(this.el).closest("#sidebar")
            sidebar.lionbars();

            sidebar.unbind('hover').hover(function() {
                sidebar.find('.lb-v-scrollbar, .lb-h-scrollbar').fadeIn(150)
            }, function() {
                sidebar.find('.lb-v-scrollbar, .lb-h-scrollbar').fadeOut(150)
            });

            sidebar.find('.lb-v-scrollbar, .lb-h-scrollbar').hide();

            sidebar.find('.lb-wrap').unbind('mousewheel').bind('mousewheel', function(event, d) {
                if ((this.scrollTop === 0 && d > 0)) {
                    event.preventDefault();
                } else if ((this.clientHeight + this.scrollTop >= this.scrollHeight) && d < 0) {
                    event.preventDefault();
                }
            })
        }
    });
})(chorus);

