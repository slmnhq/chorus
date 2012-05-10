describe("jQuery.download", function() {
    var data, form;
    beforeEach(function() {
        data = {
            name: "Bleike",
            job: "Master Developer"
        }
        spyOn($.prototype, "submit").andCallFake(function() {
            form = this;
            return form;
        }, this);
        $.download("foo bar", data, "get");
    });

    it("has the correct URL", function() {
        expect(form.attr("action")).toBe("foo bar");
    });

    it("has the correct method", function() {
        expect(form.attr("method")).toBe("get");
    });

    it("has the correct data fields", function() {
        expect(form.find("input[name=name][value=Bleike]")).toExist();;
        expect(form.find("input[name=job][value='Master Developer']")).toExist();;
    });
});
