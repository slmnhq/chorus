describe("chorus.collections.InstanceSet", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.InstanceSet([
            newFixtures.greenplumInstance.greenplum({ name: "Gun_instance" }),
            newFixtures.greenplumInstance.greenplum({ name: "cat_instance" }),
            newFixtures.greenplumInstance.greenplum({ name: "Fat_instance" }),
            newFixtures.greenplumInstance.greenplum({ name: "egg_instance" }),
            newFixtures.greenplumInstance.greenplum({ name: "Dog_instance" })
        ]);
    });

    it("does not include the accessible parameter by default", function() {
        expect(this.collection.urlParams().accessible).toBeFalsy();
    });

    it("includes accessible=true when requested", function() {
        this.collection.attributes = {hasCredentials: true};
        expect(this.collection.urlParams().accessible).toBeTruthy();
    });

    it("sorts the instances by name, case insensitively", function() {
        expect(this.collection.at(0).get("name")).toBe("cat_instance");
        expect(this.collection.at(1).get("name")).toBe("Dog_instance");
        expect(this.collection.at(2).get("name")).toBe("egg_instance");
        expect(this.collection.at(3).get("name")).toBe("Fat_instance");
        expect(this.collection.at(4).get("name")).toBe("Gun_instance");
    });
});
