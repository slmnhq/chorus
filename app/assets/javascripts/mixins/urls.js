chorus.Mixins.Urls = {
    showUrl: function() {
        if (this.isDeleted()) return null;

        if (!this.showUrlTemplate) {
            throw "No showUrlTemplate defined";
        }

        var template = _.isFunction(this.showUrlTemplate) ? this.showUrlTemplate.apply(this, arguments) : this.showUrlTemplate;
        var prefix = "#/"
        var encodedFragment = new URI(Handlebars.compile(template, {noEscape: true})(this.attributes)).normalize().toString()
        return prefix + encodedFragment;
    },

    showLink: function() {
        return Handlebars.helpers.linkTo(this.showUrl(), this.name());
    }
};
