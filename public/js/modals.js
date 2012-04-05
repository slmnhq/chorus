(function() {
    chorus.Modal = chorus.views.Base.extend({
        constructorName: "Modal",

        launchModal: function() {
            if (chorus.modal && this !== chorus.modal) {
                chorus.modal.launchSubModal(this);
            } else {
                this.launchNewModal();
            }
        },

        launchNewModal:function () {
            this.render();
            $(document).one('reveal.facebox', _.bind(this.revealed, this));
            $.facebox(this.el)

            this.previousModal = chorus.modal;
            chorus.modal = this;

            pushModalBindings(this);
        },

        launchSubModal: function(subModal) {
            popModalBindings(this);

            this.subModalId = "" + (new Date().getTime());
            $("#facebox").attr("id", "facebox-" + this.subModalId).addClass("hidden");
            $("#facebox_overlay").attr("id", "facebox_overlay-" + this.subModalId);
            $.facebox.settings.inited = false;
            subModal.isSubModal = true;
            subModal.subModalId = this.subModalId;
            subModal.launchNewModal();
        },

        postRender: function() {
            this._super("postRender");
            $('#facebox').css('left', $(window).width() / 2 - ($('#facebox .popup').width() / 2))
        },

        makeModel:function (options) {
            if (options && options.pageModel) {
                this.pageModel = options.pageModel;
                this.model = this.model || this.pageModel;
            }
        },

        closeModal:function () {
            $(document).trigger("close.facebox");
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
                this.bindings.removeAll();
                this.close();
                $("#facebox").remove();
                $.facebox.settings.inited = false;
                chorus.PageEvents.broadcast("modal:closed");
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
        revealed:$.noop
    });

    function pushModalBindings(modal) {
        modal.boundModalClosed = _.bind(modal.modalClosed, modal);
        modal.boundKeyDownHandler = _.bind(modal.keydownHandler, modal);
        $(document).one("close.facebox", modal.boundModalClosed);
        $(document).bind("keydown.facebox", modal.boundKeyDownHandler);
    }

    function popModalBindings(modal) {
        $(document).unbind("close.facebox", modal.boundModalClosed);
        $(document).unbind("keydown.facebox", modal.boundKeyDownHandler);
        delete modal.boundModalClosed;
        delete modal.boundKeyDownHandler;
    }
})();
