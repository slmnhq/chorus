chorus.presenters.InstanceList = function(options) {
    this.options = options;
};

_.extend(chorus.presenters.InstanceList.prototype, {
    present: function() {
        this.greenplum = this.options.greenplum.map(function(model) {
            return this.presentModel(model);
        }, this);

        this.hadoop = this.options.hadoop.map(function(model) {
            return this.presentModel(model);
        }, this);

        this.other = [];

        this.hasGreenplum = this.greenplum.length > 0;
        this.hasHadoop = this.hadoop.length > 0;
        this.hasOther = this.other.length > 0;

        return this;
    },

    presentModel: function(model) {
        return {
            id: model.get("id"),
            name: model.get("name"),
            description: model.get("description"),
            stateUrl: model.stateIconUrl(),
            showUrl: model.showUrl(),
            providerUrl: model.providerIconUrl(),
            isProvisioning: model.isProvisioning(),
            isFault: model.isFault(),
            stateText: model.stateText()
        };
    }
});

