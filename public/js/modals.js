;(function(ns, $) {
    ns.Modal = ns.views.Base.extend({
        launchModal : function() {
            var self = this;

            this.render();
            _.bind(this.revealed, this);
            $(document).one('reveal.facebox', this.revealed);
            $.facebox(this.el)

            ns.modal = this;

            $(document).one('close.facebox', function() {
                self.unbindPageModelCallbacks();
                self.close();
                $("#facebox").remove();
                $.facebox.settings.inited = false;
                delete ns.modal;
            });
        },

        makeModel : function(options) {
            if (options && options.pageModel) {
                this.pageModel = options.pageModel;
                this.model = this.model || this.pageModel;
            }

            this.bindPageModelCallbacks();
        },

        closeModal : function() {
            $(document).trigger("close.facebox");
        },

        close : $.noop,
        revealed : $.noop,
        bindPageModelCallbacks : $.noop,
        unbindPageModelCallbacks : $.noop
    })

    $.facebox.settings.closeImage = '/images/facebox/closelabel.png'
    $.facebox.settings.loadingImage = '/images/facebox/loading.gif'
})(chorus, jQuery);
