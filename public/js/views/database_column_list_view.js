chorus.views.DatabaseColumnList = chorus.views.Base.extend({
    tagName:"ul",
    className:"database_column_list",
    additionalClass:"list",
    events:{
        "click li":"selectColumnClick",
    },
    selectMulti: false,

    setup:function () {
        this.collection.comparator = function (column) {
            return parseInt(column.get("ordinalPosition"))
        };
        this.collection.sort();
        this.bind("column:deselected", this.deselectColumn, this);
    },

    postRender:function () {
        this.toggleColumnSelection(this.$("li:eq(0)"));
    },

    collectionModelContext:function (model) {
        return {
            typeClass:model.humanType(),
            typeString: model.get("type")
        }
    },

    deselectAll: function() {
        if (this.selectMulti) {
            _.each(this.$("li"), function(li) {
                this.toggleColumnSelection($(li), false);
            }, this);
        } else {
            this.toggleColumnSelection(this.$("li:eq(0)"));
        }
    },

    selectAll : function() {
        _.each(this.$("li"), function(li) {
            this.toggleColumnSelection($(li), true);
        }, this);
    },

    selectColumnClick: function(e) {
        this.toggleColumnSelection($(e.target).closest("li"));
    },

    toggleColumnSelection:function ($selectedColumn, forceState) {
        if (this.selectMulti) {
            var turnOn = (arguments.length == 2) ? forceState : !$selectedColumn.is(".selected");
            if (turnOn) {
                $selectedColumn.addClass("selected");
                this.trigger("column:selected", this.collection.at(this.$("li").index($selectedColumn)));
            } else {
                this.trigger("column:deselected", this.collection.at(this.$("li").index($selectedColumn)));
            }
        } else {
            var $deselected = this.$("li.selected");
            $deselected.removeClass("selected");
            this.trigger("column:deselected", this.collection.at(this.$("li").index($deselected)));

            $selectedColumn.addClass("selected");

            this.trigger("column:selected", this.collection.at(this.$("li").index($selectedColumn)));
        }
    },

    deselectColumn: function(model) {
        if(this.selectMulti) {
            this.$("li").eq(this.collection.indexOf(model)).removeClass("selected");
        }
    }
});
