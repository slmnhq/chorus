chorus.models.Workspace = chorus.models.Base.extend({
    constructorName: "Workspace",

    urlTemplate:"workspace/{{id}}",
    showUrlTemplate:"workspaces/{{id}}",
    entityType:"workspace",
    nameAttribute: 'name',

    customIconUrl:function (options) {
        options = (options || {});
        return "/workspace/" + this.get("id") + "/image?size=" + (options.size || "original");
    },

    defaultIconUrl:function (size) {
        var iconSize = size || "large";
        var activeIcon = this.isActive() ? "" : "_archived";
        var publicIcon = this.isPublic() ? "" : "private_";

        return "/images/workspaces/" + publicIcon + "workspace" + activeIcon + "_"+ iconSize +".png";
    },

    isActive: function() {
        return this.get("active") || this.get("state") == "1"
    },

    isPublic: function() {
        return this.get("isPublic");
    },

    owner: function() {
        if (this._owner) {
            return this._owner
        }
        var ownerAttrs;
        if (_.isObject(this.get("owner"))) {
            ownerAttrs = this.get("owner");
        } else {
            ownerAttrs = {
                id: this.get("ownerId"),
                username: this.get("owner"),
                first_name: this.get("ownerFirstName"),
                last_name: this.get("ownerLastName")
            };
        }
        this._owner = new chorus.models.User(ownerAttrs);
        return this._owner;
    },

    sandbox: function() {
        if (this._sandbox) return this._sandbox;
        var sandboxInfo = this.get("sandboxInfo");
        if (sandboxInfo && sandboxInfo.sandboxId) {
            var attrs = _.extend(
                {},
                sandboxInfo,
                { id: sandboxInfo.sandboxId, workspaceId: this.get('id') }
            )
            delete attrs.sandboxId;
            return this._sandbox = new chorus.models.Sandbox(attrs);
        }
    },

    datasetsInDatabase: function(database) {
        return new chorus.collections.DatasetSet([], {
            workspaceId: this.id,
            databaseName: database.get("name")
        });
    },

    datasets: function() {
        this._datasets || (this._datasets = new chorus.collections.DatasetSet([], { workspaceId: this.id }));
        return this._datasets;
    },

    comments:function () {
        this._comments || (this._comments = new chorus.collections.CommentSet(this.get("latestCommentList")));
        return this._comments;
    },

    currentUserIsOwner: function() {
        return this.owner().id === chorus.session.user().id;
    },

    currentUserIsMember: function() {
        return !!this.members().find(function(member) {
            return member.id === chorus.session.user().id;
        });
    },

    members:function () {
        if (!this._members) {
            this._members = new chorus.collections.MemberSet([], {workspaceId:this.get("id")})
            this._members.bind("saved", function () {
                this.trigger("change")
            }, this);
        }
        return this._members;
    },

    declareValidations:function (newAttrs) {
        this.require("name", newAttrs);
    },

    archiver:function () {
        return new chorus.models.User({
            fullName:(this.get("archiverFirstName") + ' ' + this.get("archiverLastName")),
            username:this.get("archiver")
        });
    },

    displayName:function () {
        return this.get("name");
    },

    displayShortName:function (length) {
        length = length || 20;

        var name = this.displayName() || "";
        return (name.length < length) ? name : name.slice(0, length) + "...";
    },

    fetchImageUrl:function (options) {
        options = (options || {});
        return "/workspace/" + this.get("id") + "/image?size=" + (options.size || "original");
    },

    createImageUrl:function (options) {
        options = (options || {});
        return "/workspace/" + this.get("id") + "/image?size=" + (options.size || "original");
    },

    picklistImageUrl:function () {
        return this.defaultIconUrl("small");
    },

    workfilesUrl: function () {
        return this.showUrl() + "/workfiles";
    },

    attrToLabel:{
        "name":"workspace.validation.name"
    },

    hasImage:function () {
        return this.get("iconId") || this.get("imageId");
    },

    canRead:function () {
        return this._hasPermission(['admin', 'read']);
    },

    canComment:function () {
        return this._hasPermission(['admin', 'commenting']);
    },

    canUpdate:function () {
        return this._hasPermission(['admin', 'update']);
    },

    workspaceAdmin:function () {
        return this._hasPermission(['admin']);
    },

    _hasPermission:function (validPermissions) {
        return _.intersection(this.get("permission"), validPermissions).length > 0;
    }
});
