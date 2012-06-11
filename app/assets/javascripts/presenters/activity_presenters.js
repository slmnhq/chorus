;(function() {
    chorus.presenters.Activity = chorus.presenters.Base.extend({
        present: function(model, options) {
            return {
                headerHtml: this.headerHtml(),
                timestamp: this.timestamp()
            };
        },

        timestamp: function() {
            return this.model.get("timestamp");
        },

        headerHtml: function() {
            return new Handlebars.SafeString(t(this.headerTranslationKey(), this.headerParams()));
        },

        headerTranslationKey: function() {
            return "activity.header." + this.model.get("action") + ".without_workspace";
        },

        headerParams: function() {
            var actor = this.model.actor();
            var target = this.model.target();

            return {
                authorLink: chorus.helpers.linkTo(actor.url(), actor.name()),
                objectLink: chorus.helpers.linkTo(target.url(), target.name())
            };
        }
    });
})();
