describe("chorus.models.Instance", function() {
    beforeEach(function() {
        this.instance = newFixtures.greenplumInstance.greenplum({id: 1, instanceVersion: "1234"});
    });

    describe("#stateIconUrl and #stateText", function() {
        it("works for 'offline' instances", function() {
            this.instance.set({ state: "offline" });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/unknown.png");
            expect(this.instance.stateText()).toMatchTranslation("instances.state.offline");
        });

        it("works for online instances", function() {
            this.instance.set({ state: "online" });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/green.png");
            expect(this.instance.stateText()).toMatchTranslation("instances.state.online");
        });

        it("works for other instances", function() {
            this.instance.set({ state: null });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/unknown.png");
            expect(this.instance.stateText()).toMatchTranslation("instances.state.unknown");
        });
    });

    describe("#version", function() {
        it("returns the correct version number", function() {
            expect(this.instance.version()).toBe("1234");
        });
    });

    describe("#owner", function() {
        it("returns a user", function() {
            var owner = this.instance.owner();
            expect(owner.get("id")).toBe(this.instance.get("owner").id);
            expect(owner.get("username")).toBe("edcadmin");
            expect(owner.displayName()).toBe("EDC Admin");
        })
    });

    describe("#isOwner", function() {
        it("returns true if object has same id", function() {
            var owner = this.instance.owner();
            var otherOwnerUser = newFixtures.user({id: owner.get('id')});
            expect(this.instance.isOwner(otherOwnerUser)).toBeTruthy();
        })
        it("returns false if id is different", function() {
            var otherOwnerUser = newFixtures.user({id: 'notanowner'});
            expect(this.instance.isOwner(otherOwnerUser)).toBeFalsy();
        })
        it("returns false if object is of different type", function() {
            var owner = this.instance.owner();
            var brokenParameter = newFixtures.greenplumInstance.greenplum({id: owner.get('id')});
            expect(this.instance.isOwner(brokenParameter)).toBeFalsy();
        })
    });
});