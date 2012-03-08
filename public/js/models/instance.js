(function() {
    var imagePrefix = "/images/instances/";

    var stateIconMap = {
        "online": "green.png",
        "fault": "red.png"
    };

    var providerIconMap = {
        "Greenplum Database": "greenplum_instance.png",
        "Hadoop": "hadoop_instance.png"
    };

    chorus.models.Instance = chorus.models.Base.extend({
        constructorName: "Instance",
        urlTemplate:"instance/{{id}}",
        showUrlTemplate: function() {
            if(this.isHadoop()) {
                return "instances/{{id}}/browse/";
            }
            return "instances"
        },

        entityType:"instance",

        declareValidations:function (newAttrs) {
            this.require("name", newAttrs);
            this.requirePattern("name", /^[a-zA-Z][a-zA-Z0-9_]*$/, newAttrs, "instance.validation.name_pattern");
            switch (newAttrs.provisionType) {
                case "register" :
                    // validating existing Greenplum instance
                    this.require("host", newAttrs);
                    this.require("port", newAttrs);
                    this.require("maintenanceDb", newAttrs);
                    this.requirePattern("port", /^\d+$/, newAttrs);
                    if (this.isNew()) {
                        this.require("dbUserName", newAttrs);
                        this.require("dbPassword", newAttrs);
                    }
                    break;
                case "create" :
                    // validating create a new Greenplum instance
                    this.require("size", newAttrs);
                    this.requirePattern("size", /^\d+$/, newAttrs);
                    break;
                case "registerHadoop":
                    this.require("host", newAttrs);
                    this.require("port", newAttrs);
                    this.require("userName", newAttrs);
                    this.require("userGroups", newAttrs);
                    this.requirePattern("port", /^\d+$/, newAttrs);
                    break;
                default :
            }
        },

        stateIconUrl: function() {
            var filename = stateIconMap[this.get("state")] || "unknown.png";
            return imagePrefix + filename;
        },

        providerIconUrl: function() {
            var filename = providerIconMap[this.get("instanceProvider")] || "other_instance.png";
            return imagePrefix + filename;
        },

        owner:function () {
            return new chorus.models.User({
                id:this.get("ownerId"),
                userName:this.get("owner"),
                fullName:this.get("ownerFullName")
            })
        },

        isOwner:function (user) {
            return this.owner().get("id") == user.get('id') && user instanceof chorus.models.User
        },

        databases:function () {
            this._databases || (this._databases = new chorus.collections.DatabaseSet([], {instanceId:this.get("id")}));
            return this._databases;
        },

        accounts:function () {
            this._accounts || (this._accounts = new chorus.collections.InstanceAccountSet([], {instanceId:this.get("id")}));
            return this._accounts;
        },

        accountForUser:function (user) {
            return new chorus.models.InstanceAccount({ instanceId:this.get("id"), userName:user.get("userName") });
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
            var ownerId = this.get("ownerId");
            return _.find(this.accounts().models, function (account) {
                return account.get("user").id == ownerId
            });
        },

        sharedAccount:function () {
            var dbUserName = this.get("sharedAccount") && this.get("sharedAccount").dbUserName;
            if (dbUserName) {
                var sharedAccount = this.accounts().first();
                if (!sharedAccount) {
                    sharedAccount = new chorus.models.InstanceAccount({ dbUserName:dbUserName, instanceId:this.get("id") });
                    this.accounts().add(sharedAccount);
                }
                return sharedAccount;
            }
        },

        attrToLabel:{
            "dbUserName":"instances.dialog.database_account",
            "dbPassword":"instances.dialog.database_password",
            "userName":"instances.dialog.hadoop_account",
            "userGroups":"instances.dialog.hadoop_group_list",
            "name":"instances.dialog.instance_name",
            "host":"instances.dialog.host",
            "port":"instances.dialog.port",
            "maintenanceDb":"instances.dialog.maintenanceDb",
            "description":"instances.dialog.description",
            "size":"instances.dialog.size"
        },

        isShared:function () {
            return !(_.isEmpty(this.get('sharedAccount')));
        },

        usage:function () {
            if (!this.instanceUsage) {
                this.instanceUsage = new chorus.models.InstanceUsage({ instanceId:this.get('id')})
            }
            return this.instanceUsage
        },

        isGreenplum: function() {
            return this.get('instanceProvider') == 'Greenplum Database'
        },

        isHadoop: function() {
            return this.get("instanceProvider") == "Hadoop";
        }
    }, {
        aurora:function () {
            if (!this._aurora) {
                this._aurora = new chorus.models.Provisioning({provisionerPluginName:"A4CProvisioner", type:"install"});
            }
            return this._aurora;
        }
    });
    
})();
