;(function(ns) {
    ns.Modal = chorus.views.Base.extend({
        launchModal : function() {
            this.render();
            _.bind(this.revealed, this);
            $(document).one('reveal.facebox', this.revealed);
            $.facebox(this.el)
        },

        revealed : function () {
            $("#facebox").removeClass().addClass("dialog_facebox");
        },

        closeModal : function() {
            $(document).trigger("close.facebox");
        }
    })

    $.facebox.settings.closeImage = '/images/facebox/closelabel.png'
    $.facebox.settings.loadingImage = '/images/facebox/loading.gif'
})(chorus)
