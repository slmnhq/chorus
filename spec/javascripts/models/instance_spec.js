describe("chorus.models.Instance", function() {
    beforeEach(function() {
        fixtures.model = "Instance";
        this.instance = fixtures.modelFor("fetch");
    });

    it("has a valid showUrl", function() {
        expect(this.instance.showUrl()).toBe("#/instances/10000");
    });

    it("has a valid url", function() {
        expect(this.instance.url()).toBe("/edc/instance/10000");
    });

    describe("#owner", function() {
        it("returns a user", function() {
            var owner = this.instance.owner();
            expect(owner.get("id")).toBe("10111");
            expect(owner.get("userName")).toBe("edcadmin");
            expect(owner.get("fullName")).toBe("EDC Admin");
        })
    });

    describe("#accountForUser", function() {
        beforeEach(function() {
            this.user = fixtures.user();
        });

        it("returns an account map", function() {
            var account = this.instance.accountForUser(this.user);
            expect(account instanceof chorus.models.Accountmap).toBeTruthy();
        });

        it("has the right urlParams", function() {
            var account = this.instance.accountForUser(this.user);
            expect(account.urlParams.userName).toBe(this.user.get("userName"));
            expect(account.urlParams.instanceId).toBe(this.instance.get("id"));
        });
    });

    describe("#accountForCurrentUser", function() {
        beforeEach(function() {
            this.currentUser = fixtures.user();
            setLoggedInUser(this.currentUser.attributes);
        });

        it("returns an account map", function() {
            var account = this.instance.accountForCurrentUser();
            expect(account instanceof chorus.models.Accountmap).toBeTruthy();
        });

        it("sets the 'userName' url parameter based on the current user", function() {
            var account = this.instance.accountForCurrentUser();
            expect(account.urlParams.userName).toBe(this.currentUser.get("userName"));
            expect(account.urlParams.instanceId).toBe(this.instance.get("id"));
        });
    });
});
