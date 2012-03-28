chorus.pages.Error = chorus.pages.Bare.extend({
    className: "error",
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
            title: this.title,
            text: this.text
        }, this.pageOptions);
    }
});
