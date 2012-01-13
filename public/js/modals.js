;(function(ns, $) {
    ns.Modal = ns.views.Base.extend({
        launchModal : function() {
            this.render();
            $(document).one('reveal.facebox', _.bind(this.revealed, this));
            $.facebox(this.el)

            this.previousModal = ns.modal;
            ns.modal = this;

            _.bindAll(this, 'modalClosed', 'keydownHandler');
            pushModalBindings(this);
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
            popModalBindings(this);

            this.subModalId = "" + (new Date().getTime());
            $("#facebox").attr("id", "facebox-" + this.subModalId).addClass("hidden");
            $("#facebox_overlay").attr("id", "facebox_overlay-" + this.subModalId);
            $.facebox.settings.inited = false;
            subModal.isSubModal = true;
            subModal.subModalId = this.subModalId;
            subModal.launchModal();
        },

        keydownHandler : function(e) {
            if (e.keyCode == 27) {
                this.escapePressed();
            }
        },

        escapePressed: function() {
            $(document).trigger("close.facebox");
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

                popModalBindings(this);
            }
        },

        subModalClosed : function() {
            $("#facebox-" + this.subModalId).attr("id", "facebox").removeClass("hidden");
            $("#facebox_overlay-" + this.subModalId).attr("id", "facebox_overlay");
            ns.modal = this.previousModal;

            pushModalBindings(this.previousModal);
        },

        close : $.noop,
        revealed : $.noop,
        bindPageModelCallbacks : $.noop,
        unbindPageModelCallbacks : $.noop
    });

    function pushModalBindings(modal) {
        $(document).one("close.facebox", modal.modalClosed);
        $(document).bind("keydown.facebox", modal.keydownHandler);
    }

    function popModalBindings(modal) {
        $(document).unbind("close.facebox", modal.modalClosed);
        $(document).unbind("keydown.facebox", modal.keydownHandler);
    }
})(chorus, jQuery);
