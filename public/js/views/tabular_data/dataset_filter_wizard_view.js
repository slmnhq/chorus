chorus.views.DatasetFilterWizard = chorus.views.Base.extend({
    className: "dataset_filter_wizard",
    persistent: true,
    events: {
        "click .add_filter": "addFilterAndRender"
    },

    setup: function() {
        this.options = this.options || {}
        this.filters = new chorus.collections.TabularDataFilterSet();
        this.bindings.add(this.collection, 'remove', this.removeInvalidFilters);
    },

    postRender: function() {
        if (!this.filters.length) {
            this.addFilter();
        }

        this.filters.each(function(filter) {
            this.renderFilterView(filter);
        }, this);

        this.tagLastLi();
    },

    resetFilters: function() {
        this.filters.reset();
        this.render();
    },

    renderFilterView: function(filter) {
        var $ul = this.$(".filters");
        var filterView = new chorus.views.DatasetFilter({model: filter, collection: this.collection, showAliasedName: this.options.showAliasedName});
        $ul.append(filterView.render().el);
        this.bindings.add(filterView, "deleted", function() {this.removeFilterView(filterView)}, this);
    },

    addFilter: function() {
        var filter = new chorus.models.TabularDataFilter()
        this.filters.add(filter);
    },

    addFilterAndRender: function(e) {
        e && e.preventDefault();
        this.addFilter();
        this.renderFilterView(this.filters.last());
        this.tagLastLi();
    },

    removeFilterView: function(filterView) {
        this.filters.remove(filterView.model);
        $(filterView.el).remove();
        this.tagLastLi();
    },

    removeInvalidFilters: function() {
        var badFilters = 0;
        this.filters.each(function(filter) {
            if(!this.collection.include(filter.get("column"))) {
                this.filters.remove(filter);
                badFilters++;
            }
        }, this);
        if(badFilters) {this.render();}
    },

    tagLastLi: function() {
        var $ul = this.$(".filters");
        $ul.find("li").removeClass("last");
        $ul.find("li:last-child").addClass("last");
    },

    filterStrings: function() {
        var wheres = this.filters.map(function(filter) {
            return filter.sqlString()
        })

        wheres = _.without(wheres, "")
        return wheres
    },

    whereClause: function() {
        var wheres = this.filterStrings();
        return wheres.length ? ("WHERE " + wheres.join(" AND ")) : "";
    },

    filterCount: function() {
        return this.filterStrings().length;
    }
});
