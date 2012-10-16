describe("chorus.models.KaggleFilterMaps", function() {
    describe("Numeric", function() {
        beforeEach(function() {
            this.kaggleFilterMap = new chorus.models.KaggleFilterMaps.Numeric();
        })

        it("should return the correct comparator symbols", function() {
            expect(this.kaggleFilterMap.comparators["greater"]).toBe(">");
            expect(this.kaggleFilterMap.comparators["less"]).toBe("<");
        });

        it("marks whole numbers as valid", function() {
            expect(this.kaggleFilterMap.performValidation({ value: "1234" })).toBeTruthy();
        })

        it("marks floating comma numbers as valid", function() {
            expect(this.kaggleFilterMap.performValidation({ value: "4,5" })).toBeTruthy();
        })

        it("marks floating point numbers as valid", function() {
            expect(this.kaggleFilterMap.performValidation({ value: "4.5" })).toBeTruthy();
        })

        it("marks non-numerical strings as invalid", function() {
            expect(this.kaggleFilterMap.performValidation({ value: "I'm the string" })).toBeFalsy();
        })

        it("marks negative numbers as valid", function() {
            expect(this.kaggleFilterMap.performValidation({ value: "-1" })).toBeTruthy();
        })

        it("marks numbers with lots of dashes as invalid", function() {
            expect(this.kaggleFilterMap.performValidation({ value: "--1" })).toBeFalsy();
            expect(this.kaggleFilterMap.performValidation({ value: "-1-" })).toBeFalsy();
            expect(this.kaggleFilterMap.performValidation({ value: "-" })).toBeFalsy();
            expect(this.kaggleFilterMap.performValidation({ value: "-1,2,.-" })).toBeFalsy();
            expect(this.kaggleFilterMap.performValidation({ value: "1-" })).toBeFalsy();
        })

        it("marks the empty field invalid", function() {
            expect(this.kaggleFilterMap.performValidation({ value: "" })).toBeFalsy();
        })
    });

    describe("String", function() {
        beforeEach(function() {
            this.kaggleFilterMap = new chorus.models.KaggleFilterMaps.String();
        })

        it("should not have any comparators", function() {
           expect(this.kaggleFilterMap.comparators).toBeUndefined();
        });

        it("should allow blank values", function() {
           expect(this.kaggleFilterMap.performValidation({ value: "" })).toBeTruthy();
        });
    });

    describe("Type", function() {
        beforeEach(function() {
            this.kaggleFilterMap = new chorus.models.KaggleFilterMaps.Type();
        });

        it("should not have any comparators", function() {
            expect(this.kaggleFilterMap.comparators).toBeUndefined();
        });

        it("requires a value", function() {
            expect(this.kaggleFilterMap.performValidation({ value : null})).toBeFalsy();
        });
    });
});