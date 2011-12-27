(function($, ns) {
    ns.TabControl = ns.Base.extend({
        className: 'tab_control',
        tagName: 'ul',

        events : {"click li" : 'setSelectedTab'},

        setup: function(options) {
            this.options = options;
        },

        additionalContext: function() {
            return {
                tabKeys: _.map(this.options, function(option) {
                    return {cssClass : option, text : t('tabs.' + option)}
                })
            };
        },

        setSelectedTab : function(evt) {
            var tab = $(evt.target)
            tab.siblings().removeClass("selected")
            tab.addClass("selected")
            this.trigger(tab.data("name") + ":selected")

            this.selectedTabName = tab.data('name');
        },

        postRender: function() {
            var tab = this.selectedTabName ? this.$("li." + this.selectedTabName) : this.$('li:first');
            tab.addClass('selected');
            this.trigger(tab.data("name") + ":selected");
        }
    });
})(jQuery, chorus.views);
