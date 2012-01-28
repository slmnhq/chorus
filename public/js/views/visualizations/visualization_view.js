chorus.views.Visualization = chorus.views.Base.extend({
    render:function () {
        var $el = $(this.el);
        $el.addClass("visualization");
        return this;
    }
});