chorus.views.Menu = chorus.views.Bare.extend({
    tagName: "ol",
    className: "components/menu",

    events: {
        "click li a": "itemClicked"
    },

    setup: function(options) {
        var launchElement = options.launchElement;
        $(launchElement).qtip({
            content: $(this.el),
            show: { event: 'click', delay: 0 },
            hide: 'unfocus',
            style: {
                tip: {
                    mimic: "top center",
                    width: 20,
                    height: 15
                }
            }
        });

        this.render();
    },

    postRender: function() {
        _.each(this.$("li a"), function(el, index) {
            $(el).data("menu-data", this.options.items[index].data);
            $(el).data("menu-callback", this.options.items[index].onSelect);
        }, this);
    },

    itemClicked: function(e) {
        e && e.preventDefault();

        var target = $(e.currentTarget);
        var callback = target.data("menu-callback");
        var data = target.data("menu-data");

        if (this.options.checkable) {
            this.$("li").removeClass("selected");
            target.parent().addClass("selected");
        }

        if (callback) {
            callback(data);
        }
        if (this.options.onChange) {
            this.options.onChange(data);
        }
    },

    context: function() {
        return {
            items: this.options.items
        }
    }
});
