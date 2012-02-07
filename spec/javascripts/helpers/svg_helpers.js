(function() {
    chorus.svgHelpers = {
        topY: function(el) {
            return _.min(coordsY(el));
        },

        bottomY: function(el) {
            return _.max(coordsY(el));
        },

        rightX: function(el) {
            return _.max(coordsX(el));
        },

        leftX: function(el) {
            return _.min(coordsX(el));
        },

        width: function(el) {
            return $(el)[0].getBBox().width
        },

        height: function(el) {
            return $(el)[0].getBBox().height
        },

        centerY: function(el) {
            var ys = coordsY(el);
            return (ys[0] + ys[1]) / 2;
        },

        centerX: function(el) {
            var xs = coordsX(el);
            return (xs[0] + xs[1]) / 2;
        }
    };

    function coordsX(el) {
        var box = $(el)[0].getBBox();
        return [box.x, box.x + box.width];
    }

    function coordsY(el) {
        var box = $(el)[0].getBBox();
        return [box.y, box.y + box.height];
    }
})();
