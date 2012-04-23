chorus.views.TypeAheadSearch = chorus.views.Base.extend({
    constructorName: "TypeAheadSearchView",
    templateName: "type_ahead_search",

    resultLimit: 5,

    makeModel: function() {
        this._super("makeModel", arguments);
        this.resource = this.model = new chorus.models.TypeAheadSearchResult();
        this.requiredResources.push(this.resource);
    },

    context: function() {
        var ctx = {query: this.model.get("query")};
        ctx.results = _.map(_.first(this.model.results(), this.resultLimit), function(result) {

            var isBinaryHdfs = result.get('entityType') == 'hdfs' && ( result.get('isBinary') !== false )

            return {
                name: result.highlightedName(),
                type: t("type_ahead.entity." + result.get('entityType')),
                url: result.showUrl(),
                linkable : !isBinaryHdfs
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
            chorus.router.navigate(selectedLi.find("a").attr("href"));
        }
    },

    searchFor: function(query) {
        this.model.set({query: query}, {silent: true});
        this.model.fetch();
    }
});
