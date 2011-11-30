;(function(ns) {


    ns.dialogs.Base = ns.Modal.extend({
        id : "dialog",
        header : $("<div id='dialog_header'/>"),
        content : $("<div id='dialog_content'/>"),
        errors : $("<div class='errors'/>"),

        render: function render() {
            this.events = this.events || {};
            this.events["click button.cancel"] = this.events["click button.cancel"] || "closeModal";

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

    })
})(chorus)
