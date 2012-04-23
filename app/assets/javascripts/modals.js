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
        $.facebox(this.el);

        this.previousModal = chorus.modal;
        this.restore();
    },

    launchSubModal: function(subModal) {
        this.ignoreFacebox();
        this.background();

        $.facebox.settings.inited = false;
        subModal.launchNewModal();
    },

    resize: function(windowWidth, windowHeight) {
        var $popup = $("#facebox .popup");
        var $facebox = $('#facebox');
        var $window = $(window);

        if (!windowHeight) windowHeight = $window.height();

        $facebox.css('top', 30 + 'px');
        var popupHeight = windowHeight - 60;
        $popup.css("max-height", popupHeight + "px");
    },

    preRender: function() {
        var result = this._super('preRender', arguments);

        $(window).resize(this.resize);

        this.preventScrollingBody();

        return result;
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
            this.ignoreFacebox();

            if (this.previousModal) {
                this.previousModal.restore();
            } else {
                this.restoreScrollingBody();
            }
        }
    },

    restore: function () {
        chorus.modal = this;
        this.foreground();
        this.listenToFacebox();
        _.defer(this.resize);
    },

    foreground: function () {
        $("#facebox-" + this.faceboxCacheId).attr("id", "facebox").removeClass("hidden");
        $("#facebox_overlay-" + this.faceboxCacheId).attr("id", "facebox_overlay");
        this.resize();
    },

    background: function () {
        this.faceboxCacheId = "" + (new Date().getTime());
        $("#facebox").attr("id", "facebox-" + this.faceboxCacheId).addClass("hidden");
        $("#facebox_overlay").attr("id", "facebox_overlay-" + this.faceboxCacheId);
    },

    listenToFacebox: function() {
        this.boundModalClosed = _.bind(this.modalClosed, this);
        this.boundKeyDownHandler = _.bind(this.keydownHandler, this);
        $(document).one("close.facebox", this.boundModalClosed);
        $(document).bind("keydown.facebox", this.boundKeyDownHandler);
    },

    ignoreFacebox: function() {
        $(document).unbind("close.facebox", this.boundModalClosed);
        $(document).unbind("keydown.facebox", this.boundKeyDownHandler);
        delete this.boundModalClosed;
        delete this.boundKeyDownHandler;
    },

    preventScrollingBody: function() {
        $("body").css("overflow", "hidden");
    },

    restoreScrollingBody: function() {
        $("body").css("overflow", "visible");
    },

    close:$.noop,
    revealed:$.noop
});

if (window.jasmine) {
    chorus.Modal.prototype.preventScrollingBody = $.noop;
    chorus.Modal.prototype.restoreScrollingBody = $.noop;
}
