chorus.collections.LdapUserSet = chorus.collections.Base.extend({
    urlTemplate: "user/ldap/",

    urlParams: function() {
        var params = {};
        if (this.attributes.userName) { params.userName = this.attributes.userName; }
        return params;
    }
});
