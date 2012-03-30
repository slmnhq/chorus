describe("chorus.ValidationRegexes", function() {
    itWorks("ChorusIdentifier64", {
        good: [ "a_valid_name", new Array(65).join("a"), "a2", "A2" ],
        bad: [ "some invalid name", new Array(66).join("a"), "123", "okay_until_$^#$%#$", "_leading_underscore" ]
    });

    itWorks("ChorusIdentifierLower64", {
        good: [ "a_valid_name", new Array(65).join("a"), "a2" ],
        bad: [ "some invalid name", new Array(66).join("a"), "123", "okay_until_$^#$%#$", "_leading_underscore", "aBc" ]
    });

    itWorks("ChorusIdentifier", {
        good: [ "a_valid_name", new Array(400).join("a"), "a2" ],
        bad: [ "some invalid name", "123", "okay_until_$^#$%#$", "_leading_underscore" ]
    });

    itWorks("SafePgName", {
        good: ['"a_good_name"', '"1number"', "a_b_c_5", "_still_good"],
        bad: ["1number", "'single quotes'", "   ", '"hi"there', "hiThere"]
    });

    itWorks("AllWhitespace", {
        good: ['', '  ', "\x09", " \x09     ", " \n "],
        bad: ["             1", "1       ", "words"]
    });

    itWorks("Time", {
        good: ['', '12:34', "12:34:56", "13:08"],
        bad: ["12345:00", ":::::", ":12:", "12:34:56:78", "1"]
    });

    itWorks("Year", {
        good: ['1', "12", "123", "1234"],
        bad: ["", "12345", "300BCE", "two thousand"]
    });

    itWorks("Month", {
        good: ['1', "9", "12", "01"],
        bad: ["13", "0", "January"]
    });

    itWorks("Day", {
        good: ['1', "9", "12", "25", "30", "31", "01"],
        bad: ["32", "0", "123", "The Fourth"]
    });

    itWorks("Boolean", {
        good: ["true", "false"],
        bad: ["1", "0", "TRUE", "yes"]
    });

    itWorks("OnlyDigits", {
        good: ["1", "1235893265312506231056123890"],
        bad: ["", "one", "12three", "a2342"]
    });

    function itWorks(functionName, options) {
        describe(functionName, function() {
            _.each(options.good, function(value) {
                it("passes for " + value, function() {
                    expect(value.match(chorus.ValidationRegexes[functionName]())).toBeTruthy();
                });
            });

            _.each(options.bad, function(value) {
                it("does not pass for " + value, function() {
                    expect(value.match(chorus.ValidationRegexes[functionName]())).toBeFalsy();
                });
            });
        });
    }

    describe("ChorusIdentifer (when given a length argument)", function() {
        it("returns a Chorus Identifier matcher with the supplied max length", function() {
            var regex = chorus.ValidationRegexes.ChorusIdentifier(4);
            expect("abc").toMatch(regex);
            expect("a123").toMatch(regex);
            expect("a1234").not.toMatch(regex);
        });
    });

    describe("ChorusIdentiferLower (when given a length argument)", function() {
        it("returns a Chorus Identifier Lower matcher with the supplied max length", function() {
            var regex = chorus.ValidationRegexes.ChorusIdentifierLower(4);
            expect("abc").toMatch(regex);
            expect("a123").toMatch(regex);
            expect("a1234").not.toMatch(regex);
            expect("aBC").not.toMatch(regex);
        });
    });
});