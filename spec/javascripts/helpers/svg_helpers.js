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

    var leftX = chorus.svgHelpers.leftX,
        rightX = chorus.svgHelpers.rightX,
        centerX = chorus.svgHelpers.centerX,
        topY = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY,
        centerY = chorus.svgHelpers.centerY,
        height = chorus.svgHelpers.height,
        width = chorus.svgHelpers.width;

    chorus.svgHelpers.matchers = {
        toBeVertical: function() {
            var y1 = topY(this.actual);
            var y2 = bottomY(this.actual);
            var x1 = leftX(this.actual);
            var x2 = rightX(this.actual);

            return y2 !== y1 && x1 === x2;
        },

        toBeHorizontal: function() {
            var y1 = topY(this.actual);
            var y2 = bottomY(this.actual);
            var x1 = leftX(this.actual);
            var x2 = rightX(this.actual);

            return y2 === y1 && x1 !== x2;
        },

        toBeWithinDeltaOf: function(value, margin) {
            if (!margin) margin = 0;
            var lowerBound = value - margin;
            var upperBound = value + margin;
            return (this.actual >= lowerBound) && (this.actual <= upperBound)
        },

        toBeLessThanOrEqualTo: function(upperBound) {
            return this.actual <= upperBound;
        },

        toBeGreaterThanOrEqualTo: function(upperBound) {
            return this.actual >= upperBound;
        },

        toBeOrderedLeftToRight: function() {
            var elements = this.actual;
            return _.all(elements, function(el, i) {
                if (!elements[i-1]) return true;
                return leftX(el) > leftX(elements[i-1]);
            });
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
