(function () {
    chorus.Modal = chorus.views.Base.extend({
        launchModal:function () {
            this.render();
            $(document).one('reveal.facebox', _.bind(this.revealed, this));
            $.facebox(this.el)

            this.previousModal = chorus.modal;
            chorus.modal = this;

            pushModalBindings(this);
        },

        makeModel:function (options) {
            if (options && options.pageModel) {
                this.pageModel = options.pageModel;
                this.model = this.model || this.pageModel;
            }

            this.bindPageModelCallbacks();
        },

        closeModal:function () {
            $(document).trigger("close.facebox");
        },

        launchSubModal:function (subModal) {
            popModalBindings(this);

            this.subModalId = "" + (new Date().getTime());
            $("#facebox").attr("id", "facebox-" + this.subModalId).addClass("hidden");
            $("#facebox_overlay").attr("id", "facebox_overlay-" + this.subModalId);
            $.facebox.settings.inited = false;
            subModal.isSubModal = true;
            subModal.subModalId = this.subModalId;
            subModal.launchModal();
        },

        keydownHandler:function (e) {
            if (e.keyCode == 27) {
                this.escapePressed();
            }
        },

        escapePressed:function () {
            $(document).trigger("close.facebox");
        },

        modalClosed:function () {
            if (this == chorus.modal) {
                this.unbindPageModelCallbacks();
                this.close();
                $("#facebox").remove();
                $.facebox.settings.inited = false;
                delete chorus.modal;

                if (this.isSubModal) {
                    this.subModalClosed();
                }

                popModalBindings(this);
            }
        },

        subModalClosed:function () {
            $("#facebox-" + this.subModalId).attr("id", "facebox").removeClass("hidden");
            $("#facebox_overlay-" + this.subModalId).attr("id", "facebox_overlay");
            chorus.modal = this.previousModal;

            pushModalBindings(this.previousModal);
        },

        close:$.noop,
        revealed:$.noop,
        bindPageModelCallbacks:$.noop,
        unbindPageModelCallbacks:$.noop
    });

    function pushModalBindings(modal) {
        $(document).one("close.facebox", _.bind(modal.modalClosed, modal));
        $(document).bind("keydown.facebox", _.bind(modal.keydownHandler, modal));
    }

    function popModalBindings(modal) {
        $(document).unbind("close.facebox", _.bind(modal.modalClosed, modal));
        $(document).unbind("keydown.facebox", _.bind(modal.keydownHandler, modal));
    }
})();
