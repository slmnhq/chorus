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
            expect(chorus.urlHelpers.fileIconUrl(fileType)).toBe("/images/workfiles/large/" + fileName + ".png");
        }

        it("maps known fileTypes to URLs correctly", function(){
            verifyUrl("C", "c");
            verifyUrl("c++", "cpp");
            verifyUrl("cc", "cpp");
            verifyUrl("cxx", "cpp");
            verifyUrl("cpp", "cpp");
            verifyUrl("csv", "csv");
            verifyUrl("doc", "doc");
            verifyUrl("excel", "xls");
            verifyUrl("h", "c");
            verifyUrl("hpp", "cpp");
            verifyUrl("hxx", "cpp");
            verifyUrl("jar", "jar");
            verifyUrl("java", "java");
            verifyUrl("pdf", "pdf");
            verifyUrl("ppt", "ppt");
            verifyUrl("r", "r");
            verifyUrl("rtf", "rtf");
            verifyUrl("sql", "sql");
            verifyUrl("txt", "text");
        });

        it("maps unknown fileTypes to plain.png", function(){
            verifyUrl("foobar", "plain");
            verifyUrl("N/A", "plain");
        });

        it("defaults to large size", function() {
            expect(chorus.urlHelpers.fileIconUrl("C")).toBe("/images/workfiles/large/c.png");
        })

        it("takes an optional size override", function() {
            expect(chorus.urlHelpers.fileIconUrl("C", "medium")).toBe("/images/workfiles/medium/c.png");
        })
    });
});