chorus.views.KaggleUserList = chorus.views.SelectableList.extend({
    templateName: "kaggle/user_list",
    eventName: "kaggleUser",

    events: {
        "click  li input[type=checkbox]": "checkboxClicked",
        "change li input[type=checkbox]": "checkboxChanged"
    },

    collectionModelContext: function(model) {
        return {
            kaggleRank: new Handlebars.SafeString(t('kaggle.rank', {rankHtml: chorus.helpers.spanFor(model.get('rank'), {'class': 'kaggle_rank'})})),
            avatarUrl: model.get("gravatarUrl") || "/images/kaggle/default_user.jpeg"
        }
    },

    postRender: function() {

        this._super("postRender", arguments);

        this.checkSelectedKaggleUsers();
    },

    setup: function() {
        this._super("setup", arguments);
        this.selectedKaggleUsers = new chorus.collections.KaggleUserSet();
        this.selectedKaggleUsers.attributes = this.collection.attributes;
        chorus.PageEvents.subscribe("selectAll", this.selectAll, this);
        chorus.PageEvents.subscribe("selectNone", this.selectNone, this);
    },

    checkboxClicked: function(e) {
        e.stopPropagation();
    },

    selectAll: function() {
        this.bindings.add(this.selectedKaggleUsers, "reset", this.selectAllFetched);
        this.selectedKaggleUsers.fetchAll();
    },

    selectAllFetched: function() {
        this.$("> li input[type=checkbox]").prop("checked", true);
        chorus.PageEvents.broadcast("kaggleUser:checked", this.selectedKaggleUsers);
    },

    selectNone: function() {
        this.selectedKaggleUsers.reset([]);
        this.$("> li input[type=checkbox]").prop("checked", false);
        chorus.PageEvents.broadcast("kaggleUser:checked", this.selectedKaggleUsers);
    },

    checkSelectedKaggleUsers: function() {
        var checkboxes = this.$("input[type=checkbox]");
        this.collection.each(function(model, i) {
            if (this.selectedKaggleUsers.get(model.id)) {
                checkboxes.eq(i).prop("checked", true);
            }
        }, this);
    },

    checkboxChanged: function(e) {
        var clickedBox = $(e.currentTarget);
        var index = this.$("> li input[type=checkbox]").index(clickedBox);
        var isChecked = clickedBox.prop("checked");
        var model = this.collection.at(index);

        if (isChecked) {
            if (!this.selectedKaggleUsers.contains(model)) {
                this.selectedKaggleUsers.add(model);
            }
        } else {
            this.selectedKaggleUsers.remove(model);
        }

        chorus.PageEvents.broadcast("kaggleUser:checked", this.selectedKaggleUsers);
    }
});
