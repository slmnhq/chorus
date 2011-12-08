;(function($) {
    window.t = function(key) {
        if (_.isEmpty($.i18n.map)) {
            jQuery.i18n.properties({
                name:'Messages',
                path:'messages/',
                mode:'map',
                language: "en_US"});
        }

        return $.i18n.prop.apply(this, arguments);
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

    _.mixin(_.str.exports());

    // set up string.trim if it doesn't exist.
    if (!_.isFunction(String.prototype.trim)) {
        String.prototype.trim = function() {
            return _.trim(this);
        }
    }
})(jQuery);
