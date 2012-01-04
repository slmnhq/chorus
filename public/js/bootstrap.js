;(function($) {
    window.t = function(key, options) {
        if (_.isObject(options)) {
            return I18n.t(key, options);
        } else {
            return I18n.t(key, _.rest(arguments));
        }
    }

    // set up default qTip style
    var errorColor = "#B61B1D";
    $.fn.qtip.styles.chorus = {
        background: errorColor,
        color: "white",
        tip: {
            corner :"leftMiddle",
            color: errorColor
        },
        border: {
            width: 0
        }
    };

    $.jGrowl.defaults.closerTemplate = '';

    _.mixin(_.str.exports());

    // make _.include use the method from underscore_string if
    // its argument is a string.
    var collectionIncludeMethod = _.include;
    _.include = _.contains = function(collectionOrString) {
        if (_.isString(collectionOrString)) {
            return _.str.include.apply(this, arguments);
        } else {
            return collectionIncludeMethod.apply(this, arguments);
        }
    };

    // set up string.trim if it doesn't exist.
    if (!_.isFunction(String.prototype.trim)) {
        String.prototype.trim = function() {
            return _.trim(this);
        }
    }
})(jQuery);
