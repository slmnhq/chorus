describe("chorus.models.Artifact", function() {
    beforeEach(function() {
        this.model = fixtures.artifact({ id: "97" });
    });

    it("has the appropriate #downloadUrl", function() {
        expect(this.model.downloadUrl()).toBe("/edc/file/97");
    });

    it("uses type for the iconUrl", function() {
        this.model.set({type: 'csv'});
        expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('csv'));
    });

    it("uses fileType for the iconUrl", function() {
        this.model.set({fileType: 'jpg'});
        expect(this.model.iconUrl()).toBe(chorus.urlHelpers.fileIconUrl('jpg'));
    });
});