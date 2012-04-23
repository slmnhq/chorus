describe("chorus.urlHelpers", function() {
    describe("fileIconUrl", function() {
        function verifyUrl(fileType, fileName) {
            expect(chorus.urlHelpers.fileIconUrl(fileType)).toBe("/images/workfiles/large/" + fileName + ".png");
        }

        it("maps known fileTypes to URLs correctly", function() {
            verifyUrl("afm", "afm");
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
            verifyUrl("txt", "txt");
            verifyUrl("docx", "doc");
            verifyUrl("xls", "xls");
            verifyUrl("xlsx", "xls");
        });

        it("maps unknown fileTypes to plain.png", function() {
            verifyUrl("foobar", "plain");
            verifyUrl("N/A", "plain");
        });

        it("defaults to large size", function() {
            expect(chorus.urlHelpers.fileIconUrl("C")).toBe("/images/workfiles/large/c.png");
        })

        it("takes an optional size override", function() {
            expect(chorus.urlHelpers.fileIconUrl("C", "medium")).toBe("/images/workfiles/medium/c.png");
        })

        it("returns 'plain' when null is passed", function() {
            verifyUrl(undefined, "plain");
        });
    });
});
