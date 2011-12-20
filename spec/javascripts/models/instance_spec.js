describe("chorus.models.Instance", function() {
    beforeEach(function() {
        this.instance = new chorus.models.Instance({id: "3"});
    });

    it("has a valid showUrl", function() {
        expect(this.instance.showUrl()).toBe("#/instances/3");
    });

    it("has a valid url", function() {
        expect(this.instance.url()).toBe("/edc/instance/3");
    });
});