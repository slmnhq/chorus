describe("chorus.collections.InstanceAccountSet", function() {
    beforeEach(function() {
        this.accountSet = new chorus.collections.InstanceAccountSet([], {instanceId : '1'});
    });

    describe("#users", function() {
        beforeEach(function() {
            this.accountSet.reset([
                fixtures.instanceAccount({ user: { id: '1', first_name: 'barnie', last_name: 'rubble' } }),
                fixtures.instanceAccount({ user: { id: '2', first_name: 'fred', last_name: 'flinstone' } })
            ]);
            this.users = this.accountSet.users();
        });

        it("returns an array of users", function() {
            expect(this.users.length).toBe(2);
        });

        it("builds user models with the 'user' attribute of the accounts", function() {
            expect(this.users[0].get("id")).toBe("2");
            expect(this.users[0].get("first_name")).toBe("fred");
            expect(this.users[0].get("last_name")).toBe("flinstone");

            expect(this.users[1].get("id")).toBe("1");
            expect(this.users[1].get("first_name")).toBe("barnie");
            expect(this.users[1].get("last_name")).toBe("rubble");
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

            expect(uri.path()).toMatchUrl("/instance/accountmap");
            expect(uri.search(true).instanceId).toBe("1");
        });
    });

    describe("sort", function() {
        beforeEach(function() {
            this.accountSet.reset([
                fixtures.instanceAccount({ user: { first_name: 'fred', last_name: 'zzz' } }),
                fixtures.instanceAccount({ user: { first_name: 'barnie', last_name: 'zzz' } }),
                fixtures.instanceAccount({ user: { first_name: 'sammy', last_name: 'aaa' } })
            ]);
        })
        it("sorts by last name, and first name", function() {
            var userNames = this.accountSet.map(function(account) {
                return account.user().get('first_name')
            });
            expect(userNames).toEqual(['sammy', 'barnie', 'fred']);
        })
    });
});
