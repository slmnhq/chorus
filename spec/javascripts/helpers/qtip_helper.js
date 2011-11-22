;(function($){
    $.fn.hasQtip = function hasQtip() {
        var sawItem = false;
        var allHaveQtip = true;
        this.each(function(index, item){
            try {
                sawItem = true;
                $(item).qtip('api');
            }
            catch (e) {
                allHaveQtip = false;
            }
        });

        return sawItem && allHaveQtip;
    }
})(jQuery);