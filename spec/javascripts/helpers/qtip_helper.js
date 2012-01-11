;(function($){
    $.fn.hasQtip = function hasQtip() {
        var sawItem = false;
        var allHaveQtip = true;
        this.each(function(index, item){
            sawItem = true;
            if (!$(item).qtip("api")) {
                allHaveQtip = false;
            }
        });

        return sawItem && allHaveQtip;
    }
})(jQuery);