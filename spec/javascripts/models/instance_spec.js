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
            this.account = this.instance.accountForUser(this.user);
        });

        it("returns an account map", function() {
            expect(this.account instanceof chorus.models.InstanceAccount).toBeTruthy();
        });

        it("sets the instance id", function() {
            expect(this.account.get("instanceId")).toBe(this.instance.get("id"));
        });

        it("sets the user name based on the current user", function() {
            expect(this.account.get("userName")).toBe(this.user.get("userName"));
        });
    });

    describe("#accountForCurrentUser", function() {
        beforeEach(function() {
            this.currentUser = fixtures.user();
            setLoggedInUser(this.currentUser.attributes);
        });

        it("memoizes", function() {
            var account = this.instance.accountForCurrentUser();
            expect(account).toBe(this.instance.accountForCurrentUser());
        });

        context("when the account is destroyed", function() {
            it("un-memoizes the account", function() {
                var previousAccount = this.instance.accountForCurrentUser();
                previousAccount.trigger("destroy");

                var account = this.instance.accountForCurrentUser();
                expect(account).not.toBe(previousAccount);
            });

            it("triggers 'change' on the instance", function() {
                spyOnEvent(this.instance, 'change');
                this.instance.accountForCurrentUser().trigger("destroy");
                expect("change").toHaveBeenTriggeredOn(this.instance);
            });
        });
    });
});
