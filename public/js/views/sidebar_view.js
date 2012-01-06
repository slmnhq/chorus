;
(function(ns) {
    ns.views.Sidebar = ns.views.Base.extend({
        preRender : function() {
            this._super("preRender", arguments);
            
            if (this.subviews && !this.subviewsBound) {
                _.each(this.subviews, _.bind(function(property, selector) {
                    var view = this.getSubview(property);
                    if (view) {
                        view.bind("rendered", this.setupSidebarScrolling, this)
                    }
                }, this));
                this.subviewsBound = true;
            }
        },

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
            var sidebar = $(this.el).closest("#sidebar");

            if (this.oldSidebarPadding) {
                sidebar.find(".lb-wrap").css("padding-right", this.oldSidebarPadding);
            }

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

            this.oldSidebarPadding = sidebar.find('.lb-wrap').css("padding-right");

            if (!$.browser.msie) {
                sidebar.find('.lb-wrap').css("padding-right", "32px");
            }
        }
    });
})(chorus);

