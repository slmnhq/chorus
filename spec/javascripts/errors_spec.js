describe("errors", function() {
    context("when there are no errors", function() {
        beforeEach(function() {
            $("#jasmine_content").html(Handlebars.VM.invokePartial(Handlebars.partials.errorDiv, "errorDiv", {}, Handlebars.helpers, Handlebars.partials))
        })

        it("renders no list items", function() {
            expect($("#jasmine_content li")).not.toExist();
        })

        it("renders no close link", function() {
            expect($("#jasmine_content a.close_errors")).not.toExist();
        })
    })

    context("when there are errors", function() {
        beforeEach(function() {
            var context = {
                serverErrors : [
                    { message : "hi" },
                    { message : "there" }
                ]
            };

            $("#jasmine_content").html(Handlebars.VM.invokePartial(Handlebars.partials.errorDiv, "errorDiv", context, Handlebars.helpers, Handlebars.partials))
        })

        it("renders a list item for each error", function() {
            expect($("#jasmine_content li").length).toBe(2);
        })

        it("has a close link", function() {
            expect($("#jasmine_content a.close_errors")).toExist();
        })

        describe("clicking the close link", function() {
            beforeEach(function() {
                $("#jasmine_content a.close_errors").click();
            })

            it("removes the error div content", function() {
                expect($("#jasmine_content .errors")).toBeEmpty();
            })
        })
    })
})