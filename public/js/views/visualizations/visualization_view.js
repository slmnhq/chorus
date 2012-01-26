;(function(ns) {
    ns.views.visualizations = {};

    ns.views.visualizations.XY = ns.views.Base.extend({
        render: function() {
            var $el = $(this.el);
            $el.addClass("visualization");

            var data = new ns.presenters.visualizations.XY(this.model, {
                x: this.options.x,
                y: this.options.y
            }).present();

            // render actual chart here

            return this;
        }
    });

    ns.views.visualizations.Boxplot = ns.views.Base.extend({
        render: function() {
            var $el = $(this.el);
            $el.addClass("visualization");

            var data = new ns.presenters.visualizations.Boxplot(this.model, {
                x: this.options.x,
                y: this.options.y
            }).present();

            // render actual chart here

            return this;
        }
    });
})(chorus);
