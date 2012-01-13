;(function(ns) {
    var sizes, weights, colors, combinations;

    sizes = [
        12,
        13,
        14,
        16,
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
        "link"
    ];

    combinations = {
        "12 normal secondary" : "secondary-text-small, activity timestamps,...",
        "12 normal dark" : "comment timestamp in dashboard workspace list sidebar",
        "12 semibold black" : "font-normal-gamma",
        "12 semibold dark"  : "font-content-details (sub-header)",
        "12 semibold link" : "sidebar actions links",

        "13 normal dark" : "dialog-label",
        "13 normal black" : "font-normal-beta",

        "14 normal dark" : "font-normal-alpha, user title in list view,...",
        "14 normal black" : "font-menu, breadcrumbs",
        "14 normal secondary" : "secondary-text-normal",
        "14 normal link"    : "normal links",
        "14 semibold dark" : "list-section-heading",
        "14 semibold link"    : "author in activity stream",

        "16 normal black" : "default font, user show page",

        "18 normal dark" : "instance name in instance list",
        "18 normal link" : "user and workfile names on list pages",
        "18 semibold link" : "workspace names on dashboard workspace list",

        "19 semibold dark" : "heading-sidebar",

        "24 semibold black" : "heading-normal"
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

            _.each(combinations, function(combinationDescription, classesString) {
                classes = classesString.split(" ");
                size = classes[0];
                weight = classes[1];
                color = classes[2];

                var td = self.findCell(size, weight, color);
                td.addClass("combination").text(combinationDescription);
            });
        },

        findCell: function(size, weight, color) {
            return this.$("tr.size" + size + "." + weight).find("td." + color);
        }
    });
})(chorus);
