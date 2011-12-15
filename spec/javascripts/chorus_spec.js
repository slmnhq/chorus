describe("chorus", function() {
    beforeEach(function() {
        this.chorus = new Chorus();
        this.backboneSpy = spyOn(Backbone.history, "start")
    })

    describe("#initialize", function() {
        it("should start the Backbone history after the session has been set", function() {
            var self = this;
            expect(this.chorus.session).toBeUndefined();
            this.backboneSpy.andCallFake(function(){expect(self.chorus.session).toBeDefined();});
            this.chorus.initialize()
            expect(Backbone.history.start).toHaveBeenCalled();
        });

        it("should create a session", function() {
            this.chorus.initialize()
            expect(this.chorus.session).toBeDefined();
        });
    });

    describe("fileIconUrl", function(){
        function verifyUrl(fileType, fileName) {
            expect(chorus.urlHelpers.fileIconUrl(fileType)).toBe("/images/workfileIcons/" + fileName + ".png");
        }

        it("maps known fileTypes to URLs correctly", function(){
            verifyUrl("C", "c");
            verifyUrl("C++", "cplusplus");
            verifyUrl("Java", "java");
            verifyUrl("sql", "sql");
            verifyUrl("txt", "text");
            verifyUrl("xml", "xml");
            verifyUrl("html", "html");
        });

        it("maps unknown fileTypes to binary.png", function(){
            verifyUrl("foobar", "binary");
            verifyUrl("N/A", "binary");
        });
    });
});