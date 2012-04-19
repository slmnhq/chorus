chorus.views.DatasetFilterWizard = chorus.views.Base.extend({
    templateName: "dataset_filter_wizard",
    persistent: true,
    events: {
        "click .add_filter": "addFilter"
    },

    setup: function() {
        this.options = this.options || {}
        this.columnSet = this.options.columnSet;
        this.collection = this.collection || new chorus.collections.TabularDataFilterSet();
        this.bindings.add(this.columnSet, 'remove', this.removeInvalidFilters);
    },

    postRender: function() {
        if (!this.collection.length) {
            this.addFilter();
        } else {
            this.collection.each(function(filter) {
                this.renderFilterView(filter);
            }, this);
        }

        this.tagLastLi();
    },

    resetFilters: function() {
        this.collection.reset();
        this.render();
    },

    renderFilterView: function(filter) {
        var $ul = this.$(".filters");
        var filterView = new chorus.views.DatasetFilter({model: filter, collection: this.columnSet, showAliasedName: this.options.showAliasedName});
        $ul.append(filterView.render().el);
        this.bindings.add(filterView, "deleted", function() {this.removeFilterView(filterView)}, this);
    },

    addFilter: function(e) {
        e && e.preventDefault();
        this.collection.add(new chorus.models.TabularDataFilter());
        this.renderFilterView(this.collection.last());
        this.tagLastLi();
    },

    removeFilterView: function(filterView) {
        this.collection.remove(filterView.model);
        $(filterView.el).remove();
        this.tagLastLi();
    },

    removeInvalidFilters: function() {
        var badFilters = this.collection.filter(function(filter) {
            return !this.columnSet.include(filter.get("column"));
        }, this);

        if(badFilters) {
            this.collection.remove(badFilters);
            this.render();
        }
    },

    tagLastLi: function() {
        var $ul = this.$(".filters");
        $ul.find("li").removeClass("last");
        $ul.find("li:last-child").addClass("last");
    },

    filterCount: function() {
        return this.collection.count();
    }
});
