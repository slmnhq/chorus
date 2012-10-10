describe("chorus.collections.GnipInstanceSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.GnipInstanceSet([
            rspecFixtures.gnipInstance({ name: "Gun_instance" }),
            rspecFixtures.gnipInstance({ name: "cat_instance" }),
            rspecFixtures.gnipInstance({ name: "Fat_instance" }),
            rspecFixtures.gnipInstance({ name: "egg_instance" }),
            rspecFixtures.gnipInstance({ name: "Dog_instance" })
        ]);
    });

    it("has the right url", function() {
        expect(this.collection.url()).toHaveUrlPath("/gnip_instances");
    });

    it("sorts the instances by name, case insensitively", function() {
        expect(this.collection.at(0).get("name")).toBe("cat_instance");
        expect(this.collection.at(1).get("name")).toBe("Dog_instance");
        expect(this.collection.at(2).get("name")).toBe("egg_instance");
        expect(this.collection.at(3).get("name")).toBe("Fat_instance");
        expect(this.collection.at(4).get("name")).toBe("Gun_instance");
    });
});
