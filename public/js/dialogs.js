;(function(ns) {
    ns.Base = chorus.views.Base.extend({
        id : "dialog",
        header : $("<div id='dialog_header'/>"),
        content : $("<div id='dialog_content'/>"),
        errors : $("<div class='errors'/>"),

        launchDialog : function() {
            this.render();
            _.bind(this.revealed, this);
            $(document).bind('reveal.facebox', this.revealed);
            $.facebox(this.el)
        },

        render: function render() {
            this.events = this.events || {};
            this.events["click button.cancel"] = this.events["click button.cancel"] || "closeDialog";

            this.header.html($("<h1/>").text(this.title))
            this.content.html(this.template(this.context()));

            $(this.el).
                empty().
                append(this.header).
                append(this.errors).
                append(this.content).
                addClass(this.className).
                attr("title", this.options.title || this.title);
            this.delegateEvents()
            this.postRender($(this.el));

            return this;
        },

        revealed : function () {
            $("#facebox").removeClass().addClass("dialog_facebox");
        },

        closeDialog : function() {
            $(document).trigger("close.facebox");
        }
    })

    $.facebox.settings.closeImage = '/images/facebox/closelabel.png'
    $.facebox.settings.loadingImage = '/images/facebox/loading.gif'
})(chorus.dialogs)