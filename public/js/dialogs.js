chorus.dialogs.Base = chorus.Modal.extend({
    constructorName: "Dialog",

    render:function render() {
        this.preRender();

        var header = $("<div class='dialog_header'/>");
        var content = $("<div class='dialog_content'/>");
        var errors = $("<div class='errors'/>")

        this.events = this.events || {};

        this.events["click .modal_controls button.cancel"] = "closeModal";

        header.html($("<h1/>").text(this.title))
        content.html(this.template(this.context()));

        $(this.el).
            empty().
            append(header).
            append(errors).
            append(content).
            addClass(this.className).
            addClass("dialog").
            addClass(this.additionalClass || "");
        this.delegateEvents()
        this.renderSubviews();
        this.renderHelps();
        this.postRender($(this.el));
        chorus.placeholder(this.$("input[placeholder], textarea[placeholder]"));

        return this;
    },

    revealed:function () {
        $("#facebox").removeClass().addClass("dialog_facebox");
    }
})
