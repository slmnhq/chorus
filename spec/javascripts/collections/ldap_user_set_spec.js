describe("chorus.collections.LdapUserSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.LdapUserSet([], { userName: "bernard" });
    });

    it("has the right url", function() {
        expect(this.collection.url()).toMatchUrl("/edc/user/ldap/?userName=bernard", {
            paramsToIgnore: ["rows", "page"]
        });
    });
});
