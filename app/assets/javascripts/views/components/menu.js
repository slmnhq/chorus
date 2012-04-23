chorus.views.Menu = chorus.views.Bare.extend({
    tagName: "ul",
    templateName: "components/menu",

    events: {
        "click li a:not([disabled=disabled])": "itemClicked"
    },

    setup: function(options) {
        var args = {
            content: $(this.el),
            show: {
                event: 'click',
                delay: 0
            },
            hide: 'unfocus',
            style: {
                classes: "tooltip-white tooltip-modal",
                tip: {
                    mimic: "top center",
                    width: 20,
                    height: 15
                }
            },
            position: {
                container: this.el,
                my: "top center",
                at: "bottom center"
            }
        };

        if (options.orientation === "right") {
            args.position.my = "top left";
            args.style.tip.offset = 40;

        } else if (options.orientation === "left") {
            args.position.my = "top right";
            args.style.tip.offset = 40;
        }

        options.launchElement.on("click", function(e) { e.preventDefault(); });
        options.launchElement.qtip(args);
        this.qtip = options.launchElement.data("qtip");
        this.render();
    },

    postRender: function() {
        _.each(this.$("li a"), function(el, i) {
            $(el).attr("data-menu-name", this.options.items[i].name);
        }, this);

        $(this.el).addClass(this.options.additionalClass);
    },

    itemClicked: function(e) {
        e.preventDefault();
        var itemName = $(e.currentTarget).attr("data-menu-name");
        this.selectItem(itemName);
        this.qtip.hide()
    },

    context: function() {
        return { items: this.options.items };
    },

    selectItem: function(name) {
        var selectedItem = _.find(this.options.items, function(item) {
            return item.name === name;
        });

        if (!selectedItem) { return; }
        if (selectedItem.onSelect) { selectedItem.onSelect.call(this, selectedItem.data); }
        if (this.options.onChange) { this.options.onChange.call(this, selectedItem.data); }

        this.showSelectedItem(name);
    },

    showSelectedItem: function(name) {
        if (this.options.checkable) {
            var li = this.$("li a[data-menu-name=" + name + "]").parent();
            this.$("li").removeClass("selected");
            li.addClass("selected");
        }
    },

    disableItem: function(name) {
        this.$("li a[data-menu-name='" + name + "']").attr("disabled", "disabled");
    },

    enableItem: function(name) {
        this.$("li a[data-menu-name='" + name + "']").attr("disabled", false);
    }
});
