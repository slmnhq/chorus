describe("chorus.views.LinkMenu", function() {
    beforeEach(function() {
        this.loadTemplate("link_menu");
    });


    describe("#render" ,function(){
       describe("with options", function(){
           beforeEach(function(){
               this.view = new chorus.views.LinkMenu({
                   options : [
                       {data : "mark", text : "bob"},
                       {data : "joanne", text : "alice"}
                   ]
               })
               this.view.render();
           })
           it("should have the correct popup options", function(){
               expect(this.view.$("li[data-type=mark] a")).toHaveText("bob")
               expect(this.view.$("li[data-type=joanne] a")).toHaveText("alice")
           })
       })
    });

});