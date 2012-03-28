chorus.pages.UnauthorizedPage = chorus.pages.Bare.extend({
    className: "unauthorized",
    additionalClass: "logged_in_layout",

    events: {
        "click button.submit": "navigateToHome"
    },

    subviews: {
        "#header": "header"
    },

    setupSubviews: function() {
        this.header = new chorus.views.Header();
    },

    navigateToHome: function() {
        chorus.router.navigate("#", true);
    },

    context: function() {
        return _.extend({
            title: t("unauthorized.title"),
            text: t("unauthorized.text")
        }, this.pageOptions);
    }
});
