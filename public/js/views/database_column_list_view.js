chorus.views.DatabaseColumnList = chorus.views.Base.extend({
    tagName:"ul",
    className:"database_column_list",
    additionalClass:"list",
    events:{
        "click li":"selectColumn",
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
        this.$("li:eq(0)").click();
    },

    collectionModelContext:function (model) {
        return {
            typeClass:model.humanType(),
            typeString: model.get("type")
        }
    },

    selectColumn:function (e) {
        var $selectedColumn = $(e.target).closest("li");
        if(this.selectMulti) {
            if ($selectedColumn.is(".selected")){
                this.trigger("column:deselected", this.collection.at(this.$("li").index($selectedColumn)));
            } else {
                $selectedColumn.addClass("selected");
                this.trigger("column:selected", this.collection.at(this.$("li").index($selectedColumn)));
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
