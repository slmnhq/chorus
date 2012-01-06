describe("chorus.models.InstanceAccountSet", function() {
    beforeEach(function() {
        this.accountSet = new chorus.models.InstanceAccountSet([],{instanceId : '1'});
    });

    describe("#url", function() {
        it("has the instanceId in the url parameters", function() {
            expect(this.accountSet.url()).toContain("/edc/instance/accountmap?instanceId=1");
        });
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
            expect(this.users[0].get("id")).toBe("1");
            expect(this.users[0].get("firstName")).toBe("barnie");
            expect(this.users[0].get("lastName")).toBe("rubble");

            expect(this.users[1].get("id")).toBe("2");
            expect(this.users[1].get("firstName")).toBe("fred");
            expect(this.users[1].get("lastName")).toBe("flinstone");
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
});