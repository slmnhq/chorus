;(function() {
    chorus.presenters.Activity = chorus.presenters.Base.extend({
        timestamp: function() {
            return chorus.helpers.relativeTimestamp(this.model.get("timestamp"));
        },

        headerHtml: function() {
            return new Handlebars.SafeString(t(headerTranslationKey.call(this), headerParams.call(this)));
        }
    });

    function headerTranslationKey() {
        return "activity.header." + this.model.get("action") + ".without_workspace";
    }

    function headerParams() {
        var actor = this.model.actor();
        var target = this.model.target();

        return {
            authorLink: chorus.helpers.linkTo(actor.url(), actor.name()),
            objectLink: chorus.helpers.linkTo(target.url(), target.name())
        };
    }
})();
