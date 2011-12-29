describe("chorus.models.Artifact", function() {
    beforeEach(function() {
        this.model = fixtures.artifact({ id: "97" });
    });

    it("has the appropriate #downloadUrl", function() {
        expect(this.model.downloadUrl()).toBe("/edc/file/97");
    })
});