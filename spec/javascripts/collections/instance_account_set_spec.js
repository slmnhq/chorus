describe("chorus.models.InstanceAccountSet", function() {
    beforeEach(function() {
        this.accountSet = new chorus.models.InstanceAccountSet([], {instanceId : '1'});
    });

    describe("#users", function() {
        beforeEach(function() {
            this.accountSet.reset([
                fixtures.instanceAccount({ user: { id: '1', firstName: 'barnie', lastName: 'rubble' } }),
                fixtures.instanceAccount({ user: { id: '2', firstName: 'fred', lastName: 'flinstone' } })
            ]);
            this.users = this.accountSet.users();
        });

        it("returns an array of users", function() {
            expect(this.users.length).toBe(2);
        });

        it("builds user models with the 'user' attribute of the accounts", function() {
            expect(this.users[0].get("id")).toBe("2");
            expect(this.users[0].get("firstName")).toBe("fred");
            expect(this.users[0].get("lastName")).toBe("flinstone");

            expect(this.users[1].get("id")).toBe("1");
            expect(this.users[1].get("firstName")).toBe("barnie");
            expect(this.users[1].get("lastName")).toBe("rubble");
        });

        context("when there are no models in the collection", function() {
            beforeEach(function() {
                this.accountSet.reset();
                this.users = this.accountSet.users();
            });

            it("returns an empty array", function() {
                expect(this.users.length).toBe(0);
            });
        });
    });

    describe("#url", function() {
        it("has the instanceId param", function() {
            var uri = new URI(this.accountSet.url());

            expect(uri.path()).toMatchUrl("/edc/instance/accountmap");
            expect(uri.search(true).instanceId).toBe("1");
        });
    });

    describe("sort", function() {
        beforeEach(function() {
            this.accountSet.reset([
                fixtures.instanceAccount({ user: { firstName: 'fred', lastName: 'zzz' } }),
                fixtures.instanceAccount({ user: { firstName: 'barnie', lastName: 'zzz' } }),
                fixtures.instanceAccount({ user: { firstName: 'sammy', lastName: 'aaa' } })
            ]);
        })
        it("sorts by last name, and first name", function() {
            var userNames = this.accountSet.map(function(account) {
                return account.user().get('firstName')
            });
            expect(userNames).toEqual(['sammy', 'barnie', 'fred']);
        })
    });
});
