chorus.pages.InvalidRoutePage = chorus.pages.Bare.extend({
    className: "invalid_route",
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
    }
});