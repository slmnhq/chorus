chorus.models.TabularDataFilter = chorus.models.Base.extend({
    setColumnCid : function(cid) {
        if(this.get("columnCid") !== cid) {
            this.set({columnCid: cid}, {silent: true});
            this.unset("comparator", {silent: true});
            this.unset("value", {silent: true});
        }
    }
});