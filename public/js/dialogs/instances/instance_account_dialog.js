;(function(ns) {
    ns.dialogs.InstanceAccount = ns.dialogs.Base.extend({
        className : "instance_account",

        events: {
            "submit form": "save"
        },

        setup: function() {
            this.title = this.options.launchElement.data("title");
        },

        makeModel: function(options) {
            this._super("makeModel", options);
            this.model = this.pageModel.accountForCurrentUser();
            this.model.bind("saved", this.saved, this);
        },

        save: function(e) {
            e.preventDefault();
            this.model.save({
                dbUserName: this.$("input[name=dbUserName]").val(),
                dbPassword: this.$("input[name=dbPassword]").val()
            });
        },

        saved: function() {
            this.closeModal();
        }
    });
})(chorus);
