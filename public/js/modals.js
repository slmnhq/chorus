;(function(ns, $) {
    ns.Modal = ns.views.Base.extend({
        launchModal : function() {
            this.render();
            _.bind(this.revealed, this);
            $(document).on('reveal.facebox', this.revealed);
            $.facebox(this.el)

            this.previousModal = ns.modal;
            ns.modal = this;

            $(document).bind('close.facebox', _.bind(this.modalClosed, this));
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

        launchSubModal : function(subModal) {
            this.subModalId = "" + (new Date().getTime());
            $("#facebox").attr("id", "facebox-" + this.subModalId).addClass("hidden");
            $("#facebox_overlay").attr("id", "facebox_overlay-" + this.subModalId);
            $.facebox.settings.inited = false;
            subModal.isSubModal = true;
            subModal.subModalId = this.subModalId;
            subModal.launchModal();
        },

        modalClosed : function() {
            if (this == ns.modal) {
                this.unbindPageModelCallbacks();
                this.close();
                $("#facebox").remove();
                $.facebox.settings.inited = false;
                delete ns.modal;

                if(this.isSubModal) {
                    this.subModalClosed();
                }
            }
        },

        subModalClosed : function() {
            $("#facebox-" + this.subModalId).attr("id", "facebox").removeClass("hidden");
            $("#facebox_overlay-" + this.subModalId).attr("id", "facebox_overlay");
            ns.modal = this.previousModal;
        },

        close : $.noop,
        revealed : $.noop,
        bindPageModelCallbacks : $.noop,
        unbindPageModelCallbacks : $.noop
    })

    $.facebox.settings.closeImage = '/images/facebox/closelabel.png'
    $.facebox.settings.loadingImage = '/images/facebox/loading.gif'
})(chorus, jQuery);
