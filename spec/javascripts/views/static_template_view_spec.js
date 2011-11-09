describe("static_template_view", function(){
    it("returns a backbone view instance", function(){
       expect(new chorus.views.StaticTemplate("party") instanceof chorus.views.Base).toBeTruthy();
    })

    it("renders the template it is passed as an argument", function(){
        var staticView = new chorus.views.StaticTemplate("foobar");
        expect(staticView.className).toBe("foobar");
    })
});