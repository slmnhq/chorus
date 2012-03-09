chorus.views.TypeAheadSearch = chorus.views.Base.extend({
    constructorName: "TypeAheadSearchView",
    className: "type_ahead_search",

    resultLimit: 5,

    makeModel: function() {
        this._super("makeModel", arguments);
        this.resource = this.model = new chorus.models.TypeAheadSearchResult();
    },

    context: function() {
        var ctx = {query: this.model.get("query")};
        var docs = this.model.has("typeAhead")? _.first(this.model.get("typeAhead").docs, this.resultLimit) : [];
        ctx.results = _.map(docs, function(result) {
            var name, url;

            switch (result.entityType) {
                case "user":
                    name = result.firstName + ' ' + result.lastName;
                    url = new chorus.models.User(result).showUrl();
                    break;
                case "workspace":
                    name = result.name;
                    url = new chorus.models.Workspace(result).showUrl();
                    break;
                case "workfile":
                    name = result.name;
                    url = new chorus.models.Workfile(result).showUrl();
                    break;
                case "hdfs":
                    name = result.name;
                    url = "#/instances/" + result.instance.id + "/browse/"
                    break;
                case "databaseObject":
                    name = result.objectName;
                    url = new chorus.models.DatabaseObject(result).showUrl();
                    break;
                case "chorusView":
                    name = result.objectName;
                    url = new chorus.models.Dataset(result).showUrl();
                    break;
                case "instance":
                    name = result.highlightedAttributes.name[0];
                    url = new chorus.models.Instance(result).showUrl();
                    break;
                default:
                    name = "Don't know how to find name for " + result.entityType;
                    break;
            }

            return {
                name :  name,
                type: t("type_ahead.entity." + result.entityType),
                url : url
            };
        });

        return ctx;
    },

    handleKeyEvent: function(event) {
        switch (event.keyCode) {
            case 40:
                this.downArrow();
                break;
            case 38:
                this.upArrow();
                break;
            case 13:
                this.enterKey();
                if (this.$("li.selected").length > 0) { event.preventDefault(); }
                break;
        }
    },

    downArrow: function() {
        var selectedLi = this.$("li.selected");
        if (selectedLi.length) {
            var nextLi = selectedLi.next("li");
            if (nextLi.length) {
                nextLi.addClass("selected");
                selectedLi.removeClass("selected");
            }
        } else {
            this.$("li").eq(0).addClass("selected");
        }
    },

    upArrow: function() {
        var selectedLi = this.$("li.selected");
        if (selectedLi.length) {
            var prevLi = selectedLi.prev("li");
            if (prevLi.length) {
                prevLi.addClass("selected");
            }

            selectedLi.removeClass("selected");
        }
    },

    enterKey: function() {
        var selectedLi = this.$("li.selected");
        if (selectedLi.length) {
            chorus.router.navigate(selectedLi.find("a").attr("href"), true);
        }
    },

    searchFor: function(query) {
        this.model.set({query: query}, {silent: true});
        this.model.fetch();
    }
});
