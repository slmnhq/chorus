describe("static_template_view", function(){
    describe("#render", function() {
        it("renders the template it is passed as an argument", function(){
            var staticView = new chorus.views.StaticTemplate("foobar");
            expect(staticView.className).toBe("foobar");
        })

        context("when passed a context object", function() {
            it("renders the template with that context", function() {
                var staticView = new chorus.views.StaticTemplate("plain_text", { text: "hi there" });
                staticView.render();
                expect($(staticView.el)).toHaveText("hi there")
            })
        })

        context("when passed a function", function() {
            it("renders the template with the results of that function", function() {
                var staticView = new chorus.views.StaticTemplate("plain_text", function() {
                    return { text : "No way"};
                });

                staticView.render();
                expect($(staticView.el)).toHaveText("No way")
            })
        })
    });
});
