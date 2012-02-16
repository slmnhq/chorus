describe("chorus.collections.InstanceSet", function() {
    it("does not include the hasCredentials parameter by default", function() {
        expect(new chorus.collections.InstanceSet().urlParams().hasCredentials).toBeFalsy();
    });

    it("includes hasCredentials=true when given it", function() {
        expect(new chorus.collections.InstanceSet([], {hasCredentials:true}).urlParams().hasCredentials).toBe(true);
    })
});