chorus.views.LinkMenu = chorus.views.Base.extend({
    className:"link_menu",

    events:{
        "click a.popup":"popupLinkClicked",
        "click .menu a":"choose"
    },

    setup:function () {
        $(document).bind("chorus:menu:popup", _.bind(this.popupEventHandler, this))
    },

    context:function () {
        var self = this;
        if (!this.options.chosen) this.options.chosen = this.options.options[0].text
        var chosen = _.find(this.options.options, function (option) {
            return option.text == self.options.chosen;
        })
        _.each(this.options.options, function (option) {
            option.hiddenClass = "hidden";
        })
        chosen.hiddenClass = "";
        return this.options
    },

    popupLinkClicked:function (ev) {
        this.poppingUp = true;

        var becomingVisible = this.$(".menu").hasClass("hidden");

        ev.preventDefault();
        ev.stopPropagation();
        this.togglePopup();

        this.triggerPopupEvent();

        if (becomingVisible) {
            this.captureClicks();
        } else {
            this.releaseClicks();
        }

        this.poppingUp = false;
    },

    togglePopup:function () {
        this.$(".menu").toggleClass("hidden");
    },

    captureClicks:function () {
        $(document).bind("click.popup_menu", _.bind(this.dismissMenu, this));
    },

    dismissMenu:function (ev) {
        this.togglePopup();
        this.releaseClicks();
    },

    releaseClicks:function () {
        $(document).unbind("click.popup_menu");
    },

    triggerPopupEvent:function (ev) {
        $(document).trigger("chorus:menu:popup", this.$(".popup"));
    },

    popupEventHandler:function (ev, el) {
        if (!$(el).is(this.$(".popup")) && !this.$(".menu").hasClass("hidden") && !this.poppingUp) {
            this.togglePopup();
            this.releaseClicks();
        }
    },

    choose:function (e) {
        e.preventDefault();
        var ul = $(e.target).closest("ul");
        this.options.chosen = $(e.target).text();
        this.dismissMenu();

        var eventName = ul.data("event");
        var pickedChoiceData = $(e.target).closest('li').data("type");
        this.trigger("choice", eventName, pickedChoiceData);
        chorus.PageEvents.broadcast("choice:" + eventName, pickedChoiceData, this);
        this.render();
    }
})
