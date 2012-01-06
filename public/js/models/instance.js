;
(function(ns) {
    ns.models.Instance = chorus.models.Base.extend({
        urlTemplate : "instance/{{id}}",
        showUrlTemplate : "instances/{{id}}",
        entityType: "instance",

        declareValidations : function(newAttrs) {
            this.require("name", newAttrs);
            this.requirePattern("name", /^[a-zA-Z][a-zA-Z0-9_]*/, newAttrs);

            switch(newAttrs.provisionType) {
                case "register" :
                    // validating existing Greenplum instance
                    this.require("host", newAttrs);
                    this.require("dbUserName", newAttrs);
                    this.require("dbPassword", newAttrs);
                    this.require("port", newAttrs);
                    this.requirePattern("port", /\d+/, newAttrs);
                    break;
                case "create" :
                    // validating create a new Greenplum instance
                    this.require("size", newAttrs);
                    this.requirePattern("size", /\d+/, newAttrs);
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

        sharedAccount: function() {
           if (this.get("sharedAccount") && this.get("sharedAccount").dbUserName) {
               this._sharedAccount || (this._sharedAccount = new ns.models.InstanceAccount({
                   instanceId: this.get("id"),
                   dbUserName: this.get("sharedAccount").dbUserName
               }));
               return this._sharedAccount;
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

        aurora : function() {
            if(!this._aurora) {
                this._aurora = new chorus.models.Provisioning({provisionerPluginName : "A4CProvisioner", type : "install"});
            }
            return this._aurora;
        },

        isShared : function() {
            return !(_.isEmpty(this.get('sharedAccount')));
        }


    });
})(chorus);
