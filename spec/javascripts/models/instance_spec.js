describe("chorus.models.Instance", function() {
    beforeEach(function() {
        this.instance = rspecFixtures.greenplumInstance({id: 1, version: "1234"});
    });

    describe("#stateIconUrl and #stateText", function() {
        it("works for 'offline' instances", function() {
            this.instance.set({ state: "offline" });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/yellow.png");
            expect(this.instance.stateText()).toMatchTranslation("instances.state.offline");
        });

        it("works for online instances", function() {
            this.instance.set({ state: "online" });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/green.png");
            expect(this.instance.stateText()).toMatchTranslation("instances.state.online");
        });

        it("works for other instances", function() {
            this.instance.set({ state: null });
            expect(this.instance.stateIconUrl()).toBe("/images/instances/yellow.png");
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
            expect(owner.get("username")).toBe("user2");
            expect(owner.displayName()).toBe("John Doe");
        })
    });

    describe("#isOwner", function() {
        it("returns true if object has same id", function() {
            var owner = this.instance.owner();
            var otherOwnerUser = rspecFixtures.user({id: owner.get('id')});
            expect(this.instance.isOwner(otherOwnerUser)).toBeTruthy();
        })
        it("returns false if id is different", function() {
            var otherOwnerUser = rspecFixtures.user({id: 'notanowner'});
            expect(this.instance.isOwner(otherOwnerUser)).toBeFalsy();
        })
        it("returns false if object is of different type", function() {
            var owner = this.instance.owner();
            var brokenParameter = rspecFixtures.greenplumInstance({id: owner.get('id')});
            expect(this.instance.isOwner(brokenParameter)).toBeFalsy();
        })
    });
});