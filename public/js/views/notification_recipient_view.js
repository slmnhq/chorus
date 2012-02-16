chorus.views.NotificationRecipient = chorus.views.Base.extend({
    className: "notification_recipient",
    useLoadingSection: true,
    events: {
        "click a.add_user" : "onAddUserClicked",
        "click .remove" : "onRemoveClicked"
    },

    makeModel: function() {
        this.pickedUsers = [];
        this.collection = new chorus.collections.UserSet();
        this.collection.fetchAll();
    },

    postRender: function() {
        chorus.styleSelect(this.$("select"));
    },

    onAddUserClicked: function(e) {
        e && e.preventDefault();

        var id = this.$("select").val();
        var name = this.$("select option:selected").text();

        var $span = this.$("<span class='name'></span>").text(name);
        var $remove = $('<a href="#" class="remove"/>').text(t("notification_recipient.remove"));
        var $li = this.$("<li></li>").append($span).append($remove).data("id", id.toString());

        this.$(".picked_users").append($li);
        this.pickedUsers.push(id);
    },

    onRemoveClicked : function(e) {
        e && e.preventDefault();

        var $li = $(e.target).parent();
        this.pickedUsers = _.without(this.pickedUsers, $li.data("id"));
        $li.remove();
    }
});

