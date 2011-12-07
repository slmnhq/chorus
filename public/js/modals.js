;(function(ns, $) {
    ns.Modal = ns.views.Base.extend({
        launchModal : function() {
            this.render();
            _.bind(this.revealed, this);
            $(document).one('reveal.facebox', this.revealed);
            $.facebox(this.el)

            ns.modal = this;
            $(document).one('close.facebox', function(){delete ns.modal});
        },

        makeModel : function(options) {
            if (options && options.pageModel) {
                this.pageModel = options.pageModel;
            }
            this.bindPageModelCallbacks();
        },

        closeModal : function() {
            $(document).trigger("close.facebox");
        },

        bindPageModelCallbacks : $.noop
    })

    $.facebox.settings.closeImage = '/images/facebox/closelabel.png'
    $.facebox.settings.loadingImage = '/images/facebox/loading.gif'
})(chorus, jQuery);
