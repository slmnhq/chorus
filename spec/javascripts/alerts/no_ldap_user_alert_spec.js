describe("chorus.alerts.NoLdapUser", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.NoLdapUser({ username: "robert_lee" });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.alert.render();
        });

        it("has the right title", function() {
            expect(this.alert.$(".content h1")).toContainTranslation("users.ldap.none_found", { username: "robert_lee" });
        });

        it("has the right body", function() {
            expect(this.alert.$(".content p")).toContainTranslation("users.ldap.must_match");
        });

        it("hides the submit button", function() {
            expect(this.alert.$(".submit")).toHaveClass("hidden");
        });
    });
});
