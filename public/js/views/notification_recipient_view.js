chorus.views.NotificationRecipient = chorus.views.Base.extend({
    className: "notification_recipient",
    useLoadingSection: true,
    events: {
        "click a.add_user" : "onAddUserClicked",
        "click .remove" : "onRemoveClicked"
    },

    makeModel: function() {
        this.collection = new chorus.collections.UserSet();
        this.collection.sortAsc("firstName");
        this.collection.fetchAll();
    },

    postRender: function() {
        chorus.styleSelect(this.$("select"));
    },

    onAddUserClicked: function(e) {
        e && e.preventDefault();

        var id = this.$("select").val();
        if (this.$("li[data-id='" + id + "']").length == 0) {

            var name = this.$("select option:selected").text();
            var $span = this.$("<span class='name'></span>").text(name);
            var $remove = $('<a href="#" class="remove"/>').text(t("notification_recipient.remove"));
            var $li = this.$("<li></li>").append($span).append($remove).attr("data-id", id.toString());

            this.$(".picked_users").append($li);
        }
    },

    onRemoveClicked : function(e) {
        e && e.preventDefault();
        $(e.target).parent().remove();
    },

    getPickedUsers : function() {
        var ids = _.map(this.$(".picked_users li"), function(li){
            return $(li).attr("data-id");
        });

        var $selected = this.$("option:selected");
        if ($selected.length) {
            ids.push($selected.val());
        }

        return _.uniq(ids);
    }
});

