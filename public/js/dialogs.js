;(function(ns) {
    ns.Base = chorus.views.Base.extend({
        container: $("<div id='dialog'/>"),
        header : $("<div id='dialog_header'/>"),
        content : $("<div id='dialog_content'/>"),

        launchDialog : function() {
            this.render();
            $.facebox(this.el)
        },

        render: function render() {
            this.header.html($("<h1/>").text(this.title))
            this.content.html(this.template(this.context()));

            this.container.
                html("").
                append(this.header).
                append(this.content).
                addClass(this.className).
                attr("title", this.options.title || this.title);

            $(this.el).html(this.container)

            this.postRender($(this.el));

            return this;
        }
    })

    $.facebox.settings.closeImage = '/images/facebox/closelabel.png'
    $.facebox.settings.loadingImage = '/images/facebox/loading.gif'
})(chorus.dialogs)