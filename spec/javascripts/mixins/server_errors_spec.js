describe("chorus.Mixins.ServerErrors", function() {
    var HostModel;

    beforeEach(function() {
        HostModel = chorus.models.Base.include(chorus.Mixins.ServerErrors);
    });

    describe("#serverErrorMessages", function() {
        context("when the model has serverErrors", function() {
            beforeEach(function() {
                this.host = new HostModel({});
            });

            it("returns a default error message", function() {
                this.host.serverErrors = {fields: {a: {BLANK: {}}}}
                expect(_.first(this.host.serverErrorMessages())).toBe("A can't be blank");
            });

            it("returns a custom error message", function() {
                this.host.serverErrors = {fields: {workspaces: {EMPTY: {}}}}
                expect(_.first(this.host.serverErrorMessages())).toBe("You must have access to a workspace with a sandbox to create an hdfs external table for this file");
            });

            it("interpolates extra arguments", function() {
                this.host.serverErrors = {fields: {a: {EQUAL_TO: {count: 5}}}}
                expect(_.first(this.host.serverErrorMessages())).toBe("A must be equal to 5");
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

