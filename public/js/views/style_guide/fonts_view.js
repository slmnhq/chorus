;(function(ns) {
    var sizes, weights, colors;

    sizes = [
        12,
        13,
        14,
        18,
        19,
        24
    ];

    weights = [
        "normal",
        "semibold"
    ];

    colors = [
        "black",
        "dark",
        "secondary",
        "weak",
        "link",
    ];

    mixins = {
        "24 semibold black" : "heading-normal",
        "19 semibold dark" : "heading-sidebar",
        "13 normal dark" : "dialog-label",
        "14 normal dark" : "font-normal-alpha",
        "13 normal black" : "font-normal-beta",
        "12 semibold black" : "font-normal-gamma",
        "12 semibold dark"  : "font-content-details",
        "14 normal black" : "font-menu",
        "14 semibold dark" : "list-section-heading",
        "14 normal secondary" : "secondary-text-normal",
        "12 normal secondary" : "secondary-text-small",
    };

    var sizeWeightCombos = [];
    _.each(sizes, function(size) {
        _.each(weights, function(weight) {
            sizeWeightCombos.push("size" + size + " " + weight);
        });
    });

    ns.views.StyleGuideFonts = ns.views.Base.extend({
        className: "style_guide_fonts",

        context: function() {
            return { sizes: sizeWeightCombos, colors: colors };
        },

        postRender: function() {
            var classes, size, weight, color;
            var self = this;

            _.each(mixins, function(mixinName, classesString) {
                classes = classesString.split(" ");
                size = classes[0];
                weight = classes[1];
                color = classes[2];

                var td = self.findCell(size, weight, color);
                td.addClass("mixin").text(mixinName);
            });
        },

        findCell: function(size, weight, color) {
            return this.$("tr.size" + size + "." + weight).find("td." + color);
        }
    });
})(chorus);
