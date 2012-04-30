describe("chorus.collections.LdapUserSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.LdapUserSet([], { username: "bernard" });
    });

    it("has the right url", function() {
        expect(this.collection.url()).toMatchUrl("/user/ldap/?username=bernard", {
            paramsToIgnore: ["rows", "page"]
        });
    });
});
