describe("chorus.features", function() {
    beforeEach(function() {
        this.browserMozilla = $.browser.mozilla;
        this.browserVersion = $.browser.version;
    });

    afterEach(function() {
        $.browser.mozilla = this.browserMozilla;
        $.browser.version = this.browserVersion;
    });

    describe("multipleFileUpload", function() {
        it("should return false if mozilla and less than version 2.0", function() {
            $.browser.version = '1.9';
            $.browser.mozilla = true;
            chorus.detectFeatures();
            expect(chorus.features.multipleFileUpload).toBeFalsy();
        });

        it("should return true if mozilla and greater than version 1.9", function() {
            $.browser.version = '2.0';
            $.browser.mozilla = true;
            chorus.detectFeatures();
            expect(chorus.features.multipleFileUpload).toBeTruthy();
        });

        it("should return true if not mozilla and less than version 2.0", function() {
            $.browser.version = '1.9';
            $.browser.mozilla = false;
            chorus.detectFeatures();
            expect(chorus.features.multipleFileUpload).toBeTruthy();
        });
    });
});