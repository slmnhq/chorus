(function() {
    var imagePrefix = "/images/instances/";

    var stateIconMap = {
        "online": "green.png",
        "offline": "red.png"
    };

    var providerIconMap = {
        "Greenplum Database": "greenplum_instance.png",
        "Hadoop": "hadoop_instance.png"
    };

    chorus.models.Instance = chorus.models.Base.extend({
        constructorName: "Instance",
        urlTemplate:"instances/{{id}}",
        nameAttribute: 'name',

        showUrlTemplate: function() {
            if(this.isHadoop()) {
                return "instances/{{id}}/browse/";
            }
            return "instances/{{id}}/databases";
        },

        entityType:"instance",

        declareValidations:function (newAttrs) {
            this.require("name", newAttrs);
            this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(), newAttrs, "instance.validation.name_pattern");
            switch (newAttrs.provision_type) {
                case "register" :
                    this.require("host", newAttrs);
                    this.require("port", newAttrs);
                    this.require("maintenance_db", newAttrs);
                    this.requirePattern("port", chorus.ValidationRegexes.OnlyDigits(), newAttrs);
                    if (this.isNew()) {
                        this.require("db_username", newAttrs);
                        this.require("db_password", newAttrs);
                    }
                    break;
                case "create" :
                    this.requirePattern("name", chorus.ValidationRegexes.ChorusIdentifier(44), newAttrs);
                    this.requireIntegerRange("size", 1, chorus.models.Config.instance().get("provisionMaxSizeInGB"), newAttrs);
                    if( this.isNew()) {
                        this.requirePattern("databaseName", chorus.ValidationRegexes.ChorusIdentifier(63), newAttrs);
                        this.requirePattern("schemaName", chorus.ValidationRegexes.ChorusIdentifier(63), newAttrs);
                        this.require("db_username", newAttrs);
                        this.requirePattern("db_password", chorus.ValidationRegexes.Password({min: 6, max: 256}), newAttrs);
                    }
                    break;
                case "registerHadoop":
                    this.require("host", newAttrs);
                    this.require("port", newAttrs);
                    this.require("userName", newAttrs);
                    this.require("userGroups", newAttrs);
                    this.requirePattern("port", chorus.ValidationRegexes.OnlyDigits(), newAttrs);
                    break;
                default :
            }
        },

        stateIconUrl: function() {
            var filename = stateIconMap[this.get("state")] || "unknown.png";
            return imagePrefix + filename;
        },

        providerIconUrl: function() {
            var filename = providerIconMap[this.get("instance_provider")] || "other_instance.png";
            return imagePrefix + filename;
        },

        owner:function () {
            return new chorus.models.User(
                this.get("owner")
            )
        },

        isOwner:function (user) {
            return this.owner().get("id") == user.get('id') && user instanceof chorus.models.User
        },

        databases:function () {
            this._databases || (this._databases = new chorus.collections.DatabaseSet([], {instance_id:this.get("id")}));
            return this._databases;
        },

        accounts:function () {
            this._accounts || (this._accounts = new chorus.collections.InstanceAccountSet([], {instance_id:this.get("id")}));
            return this._accounts;
        },

        accountForUser:function (user) {
            return new chorus.models.InstanceAccount({ instance_id:this.get("id"), userId: user.get("id") });
        },

        accountForCurrentUser:function () {
            if (!this._accountForCurrentUser) {
                this._accountForCurrentUser = this.accountForUser(chorus.session.user());
                this._accountForCurrentUser.bind("destroy", function () {
                    delete this._accountForCurrentUser;
                    this.trigger("change");
                }, this);
            }
            return this._accountForCurrentUser;
        },

        accountForOwner:function () {
            var ownerId = this.get("owner").id;
            return _.find(this.accounts().models, function (account) {
                return account.get("owner").id == ownerId
            });
        },

        sharedAccount:function () {
            if (this.get("shared") && this.get("sharedAccount")) {
                var db_username = this.get("sharedAccount").db_username;
                var sharedAccount = this.accounts().first();
                if (!sharedAccount) {
                    sharedAccount = new chorus.models.InstanceAccount({ db_username:db_username, instance_id:this.get("id") });
                    this.accounts().add(sharedAccount);
                }
                return sharedAccount;
            }
        },

        isProvisioning: function() {
            return this.get("state") == "provisioning";
        },

        isFault: function() {
            return this.get("state") == "offline";
        },

        isOnline: function() {
            return this.get("state") == "online";
        },

        attrToLabel:{
            "db_username":"instances.dialog.database_account",
            "db_password":"instances.dialog.database_password",
            "userName":"instances.dialog.hadoop_account",
            "userGroups":"instances.dialog.hadoop_group_list",
            "name":"instances.dialog.instance_name",
            "host":"instances.dialog.host",
            "port":"instances.dialog.port",
            "databaseName": "instances.dialog.database_name",
            "maintenance_db":"instances.dialog.maintenance_db",
            "description":"instances.dialog.description",
            "size":"instances.dialog.size"
        },

        isShared:function () {
            return !(_.isEmpty(this.get('sharedAccount')));
        },

        usage:function () {
            if (!this.instanceUsage) {
                this.instanceUsage = new chorus.models.InstanceUsage({ instance_id:this.get('id')})
            }
            return this.instanceUsage
        },

        isGreenplum: function() {
            return this.get('instance_provider') == 'Greenplum Database'
        },

        isHadoop: function() {
            return this.get("instance_provider") == "Hadoop";
        },

        hasWorkspaceUsageInfo: function() {
            return !this.isHadoop() && this.usage().has("workspaces");
        },

        version: function() {
            return this.get("instanceVersion");
        }
    }, {
        aurora:function () {
            if (!this._aurora) {
                this._aurora = new chorus.models.Provisioning({provisionerPluginName:"A4CProvisioner", type:"install"});
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
})();
