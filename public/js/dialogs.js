(function(ns) {
    ns.Base = chorus.views.Base.extend({
        render: function render() {
            header_div = $("<div id='dialog_header'><h1>" + this.title + "</h1></div>")
            content_div = $("<div id='dialog_content'/>")

            content_div.html(this.template(this.context()));

            container_div = $("<div id='dialog'/>").
                append(header_div).
                append(content_div).
                addClass(this.className).
                attr("title", this.options.title || this.title);

            $(this.el).html(container_div)

            this.postRender($(this.el));
            return this;
        }
    })
})(chorus.dialogs)