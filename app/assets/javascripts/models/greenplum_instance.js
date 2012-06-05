chorus.models.GreenplumInstance = chorus.models.Instance.extend({
    constructorName: "GreenplumInstance",
    urlTemplate: "instances/{{id}}", // TODO change instance to greenplum instance in backend later
    nameAttribute: 'name',

    showUrlTemplate: "instances/{{id}}/databases",

    entityType: "instance",
    parameterWrapper: "instance",

    dataBinding: 'data-greenplum-instance-id',

    declareValidations: function(newAttrs) {
        this.require("name", newAttrs);
        this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "instance.validation.name_pattern");
        switch (newAttrs.provision_type) {
            case "register" :
                this.require("host", newAttrs);
                this.require("port", newAttrs);
                this.require("maintenanceDb", newAttrs);
                this.requirePattern("port", chorus.ValidationRegexes.OnlyDigits(), newAttrs);
                if (this.isNew()) {
                    this.require("dbUsername", newAttrs);
                    this.require("dbPassword", newAttrs);
                }
                break;
            case "create" :
                this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(44), newAttrs);
                this.requireIntegerRange("size", 1, chorus.models.Config.instance().get("provisionMaxSizeInGB"), newAttrs);
                if (this.isNew()) {
                    this.requirePattern("databaseName", chorus.ValidationRegexes.ChorusIdentifier(63), newAttrs);
                    this.requirePattern("schemaName", chorus.ValidationRegexes.ChorusIdentifier(63), newAttrs);
                    this.require("dbUsername", newAttrs);
                    this.requirePattern("dbPassword", chorus.ValidationRegexes.Password({min: 6, max: 256}), newAttrs);
                }
                break;
            default :
        }
    },

    providerIconUrl: function() {
        return this._imagePrefix + "greenplum_instance.png";
    },

    databases: function() {
        this._databases || (this._databases = new chorus.collections.DatabaseSet([], {instanceId: this.get("id")}));
        return this._databases;
    },

    accounts: function() {
        this._accounts || (this._accounts = new chorus.collections.InstanceAccountSet([], {instanceId: this.get("id")}));
        return this._accounts;
    },

    accountForUser: function(user) {
        return new chorus.models.InstanceAccount({ instanceId: this.get("id"), userId: user.get("id") });
    },

    accountForCurrentUser: function() {
        if (!this._accountForCurrentUser) {
            this._accountForCurrentUser = this.accountForUser(chorus.session.user());
            this._accountForCurrentUser.bind("destroy", function() {
                delete this._accountForCurrentUser;
                this.trigger("change");
            }, this);
        }
        return this._accountForCurrentUser;
    },

    accountForOwner: function() {
        var ownerId = this.get("owner").id;
        return _.find(this.accounts().models, function(account) {
            return account.get("owner").id == ownerId
        });
    },

    attrToLabel: {
        "dbUsername": "instances.dialog.database_account",
        "dbPassword": "instances.dialog.database_password",
        "userName": "instances.dialog.hadoop_account",
        "userGroups": "instances.dialog.hadoop_group_list",
        "name": "instances.dialog.instance_name",
        "host": "instances.dialog.host",
        "port": "instances.dialog.port",
        "databaseName": "instances.dialog.database_name",
        "maintenanceDb": "instances.dialog.maintenance_db",
        "description": "instances.dialog.description",
        "size": "instances.dialog.size"
    },

    isShared: function() {
        return !!this.get("shared");
    },

    usage: function() {
        if (!this.instanceUsage) {
            this.instanceUsage = new chorus.models.InstanceUsage({ instanceId: this.get('id')})
        }
        return this.instanceUsage
    },

    isGreenplum: function() {
        return true;
    },

    isHadoop: function() {
        return false;
    },

    hasWorkspaceUsageInfo: function() {
        return !this.isHadoop() && this.usage().has("workspaces");
    },

    sharing: function() {
        if (!this._sharing) {
            this._sharing = new chorus.models.InstanceSharing({instanceId: this.get("id")})
        }
        return this._sharing;
    }
}, {
    aurora: function() {
        if (!this._aurora) {
            this._aurora = new chorus.models.Provisioning({provisionerPluginName: "A4CProvisioner", type: "install"});
        }
        return this._aurora;
    },

    auroraTemplates: function() {
        if (!this._templates) {
            this._templates = new chorus.collections.ProvisioningTemplateSet([], {provisionerPluginName: "A4CProvisioner"});
        }
        return this._templates;
    }
});
