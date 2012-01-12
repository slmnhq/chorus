;
(function(ns) {
    ns.models.Instance = chorus.models.Base.extend({
        urlTemplate : "instance/{{id}}",
        showUrlTemplate : "instances/{{id}}",
        entityType: "instance",

        declareValidations : function(newAttrs) {
            this.require("name", newAttrs);
            this.requirePattern("name", /^[a-zA-Z][a-zA-Z0-9_]*$/, newAttrs, "instance.validation.name_pattern");

            switch(newAttrs.provisionType) {
                case "register" :
                    // validating existing Greenplum instance
                    this.require("host", newAttrs);
                    this.require("dbUserName", newAttrs);
                    this.require("dbPassword", newAttrs);
                    this.require("port", newAttrs);
                    this.requirePattern("port", /^\d+$/, newAttrs);
                    break;
                case "create" :
                    // validating create a new Greenplum instance
                    this.require("size", newAttrs);
                    this.requirePattern("size", /^\d+$/, newAttrs);
                    break;
                default :
            }
        },

        owner : function() {
            return new ns.models.User({
                id : this.get("ownerId"),
                userName : this.get("owner"),
                fullName : this.get("ownerFullName")
            })
        },

        isOwner : function(user) {
            return this.owner().get("id") == user.get('id') && user instanceof chorus.models.User
        },

        databases : function() {
            return new ns.models.DatabaseSet([], {instanceId : this.get("id")});
        },

        accounts: function() {
            this._accounts || (this._accounts = new ns.models.InstanceAccountSet([], {instanceId : this.get("id")}));
            return this._accounts;
        },

        accountForUser: function(user) {
            return new ns.models.InstanceAccount({ instanceId: this.get("id"), userName: user.get("userName") });
        },

        accountForCurrentUser: function() {
            if (!this._accountForCurrentUser) {
                this._accountForCurrentUser = this.accountForUser(ns.session.user());
                this._accountForCurrentUser.bind("destroy", function() {
                    delete this._accountForCurrentUser;
                    this.trigger("change");
                }, this);
            }
            return this._accountForCurrentUser;
        },

        accountForOwner : function() {
            var ownerId = this.get("ownerId");
            return _.find(this.accounts().models, function(account) {return account.get("user").id == ownerId});
        },

        sharedAccount: function() {
            var dbUserName = this.get("sharedAccount") && this.get("sharedAccount").dbUserName;
            if (dbUserName) {
                var sharedAccount = this.accounts().first();
                if (!sharedAccount) {
                    sharedAccount = new chorus.models.InstanceAccount({ dbUserName: dbUserName, instanceId: this.get("id") });
                    this.accounts().add(sharedAccount);
                }
                return sharedAccount;
            }
        },

        attrToLabel : {
            "dbUserName" : "instances.dialog.database_account",
            "dbPassword" : "instances.dialog.database_password",
            "name" : "instances.dialog.instance_name",
            "host" : "instances.dialog.host",
            "port" : "instances.dialog.port",
            "description" : "instances.dialog.description",
            "size" : "instances.dialog.size"
        },

        isShared : function() {
            return !(_.isEmpty(this.get('sharedAccount')));
        }
    }, {
        aurora : function() {
            if(!this._aurora) {
                this._aurora = new chorus.models.Provisioning({provisionerPluginName : "A4CProvisioner", type : "install"});
            }
            return this._aurora;
        }
    });
})(chorus);
