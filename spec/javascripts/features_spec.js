describe("chorus.features", function() {
    beforeEach(function() {
        this.browserMsie = $.browser.msie;
    });

    afterEach(function() {
        $.browser.msie = this.browserMsie;
    });

    describe("fileProgress", function() {
        it("should return false if msie", function() {
            $.browser.msie = true;
            chorus.detectFeatures();
            expect(chorus.features.fileProgress).toBeFalsy();
        });

        it("should return true if not msie", function() {
            $.browser.msie = false;
            chorus.detectFeatures();
            expect(chorus.features.fileProgress).toBeTruthy();
        });
    });
});