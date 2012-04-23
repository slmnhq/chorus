describe("chorus.collections.InstanceSet", function() {
    it("does not include the hasCredentials parameter by default", function() {
        expect(new chorus.collections.InstanceSet().urlParams().hasCredentials).toBeFalsy();
    });

    it("includes hasCredentials=true when given it", function() {
        expect(new chorus.collections.InstanceSet([], {hasCredentials:true}).urlParams().hasCredentials).toBe(true);
    })

    it("sorts the instances by name, case insensitively", function() {
        var collection = new chorus.collections.InstanceSet();
        collection.reset([
            fixtures.instance({ name: "Gun_instance" }),
            fixtures.instance({ name: "cat_instance" }),
            fixtures.instance({ name: "Fat_instance" }),
            fixtures.instance({ name: "egg_instance" }),
            fixtures.instance({ name: "Dog_instance" })
        ]);

        expect(collection.pluck("name")).toEqual([
            "cat_instance",
            "Dog_instance",
            "egg_instance",
            "Fat_instance",
            "Gun_instance"
        ]);
    });
});
