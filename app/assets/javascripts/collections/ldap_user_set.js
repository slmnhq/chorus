chorus.collections.LdapUserSet = chorus.collections.Base.extend({
    urlTemplate: "user/ldap/",

    urlParams: function() {
        var params = {};
        if (this.attributes.username) { params.username = this.attributes.username; }
        return params;
    }
});
