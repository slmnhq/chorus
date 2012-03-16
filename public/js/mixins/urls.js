chorus.Mixins.Urls = {
    showUrl: function() {
        if (this.isDeleted()) return null;

        if (!this.showUrlTemplate) {
            throw "No showUrlTemplate defined";
        }

        var template = _.isFunction(this.showUrlTemplate) ? this.showUrlTemplate.apply(this, arguments) : this.showUrlTemplate;
        var attributes = _.isFunction(this.urlTemplateAttributes) ? this.urlTemplateAttributes() : this.attributes;

        var prefix = "#/"
        var encodedFragment = new URI(Handlebars.compile(template, {noEscape: true})(attributes)).normalize().toString()
        return prefix + encodedFragment;
    }
};
