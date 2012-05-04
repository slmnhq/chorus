describe("chorus.Mixins.ServerErrors", function() {
    var HostModel;

    beforeEach(function() {
        HostModel = chorus.models.Base.include(chorus.Mixins.ServerErrors);
    });

    describe("#serverErrorMessages", function() {
        context("when the model has serverErrors", function() {
            beforeEach(function() {
                this.host = new HostModel({});
                this.host.serverErrors = {fields: {a: {BLANK: {}}}}
            });

            it("returns the error message", function() {
                expect(_.first(this.host.serverErrorMessages())).toBe("A can't be blank");
            });
        });

        context("when the model does not have serverErrors", function() {
            beforeEach(function() {
                this.host = new HostModel();
            });

            it("returns false", function() {
                expect(this.host.serverErrorMessages()).toEqual([]);
            });
        });
    });

    describe("#serverErrorMessage", function() {
        it("joins all the server error messages", function() {
            this.host = new HostModel({});
            this.host.serverErrors = {fields: {first: {GENERIC: {message: "fail"}}, second: {GENERIC: {message: "oops"}}}};

            expect(this.host.serverErrorMessage()).toBe("fail\noops");
        });
    });
});

