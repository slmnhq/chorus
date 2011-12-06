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

        closeModal : function() {
            $(document).trigger("close.facebox");
        },

        attachPageModel : function(pageModel) {
            this.pageModel = pageModel;
            this.bindPageModelCallbacks();
        },

        bindPageModelCallbacks : $.noop
    })

    $.facebox.settings.closeImage = '/images/facebox/closelabel.png'
    $.facebox.settings.loadingImage = '/images/facebox/loading.gif'
})(chorus, jQuery);
