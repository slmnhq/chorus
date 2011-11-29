describe("chorus.views.LinkMenu", function() {
    beforeEach(function() {
        this.loadTemplate("link_menu");
    });


    describe("#render", function() {


        describe("with options", function() {
            beforeEach(function() {
                this.view = new chorus.views.LinkMenu({
                    options : [
                        {data : "mark", text : "bob"},
                        {data : "joanne", text : "alice"}
                    ]
                })
                this.view.render();
            })
            it("should have the correct popup options", function() {
                expect(this.view.$("li[data-type=mark] a")).toHaveText("bob")
                expect(this.view.$("li[data-type=joanne] a")).toHaveText("alice")
            })
            describe("chosen option", function() {
                it("defaults to the first option", function() {
                    expect(this.view.$(".chosen")).toHaveText("bob")
                })
                it("renders the chosen option", function() {
                    this.view.options.chosen = "alice"
                    this.view.render();
                    expect(this.view.$(".chosen")).toHaveText("alice")
                })
            })

            it("should have a hidden menu", function() {
                expect(this.view.$(".menu")).toHaveClass("hidden");
            })

            describe("clicking the filter link", function() {
                beforeEach(function() {
                    this.view.$("a.popup").click();
                });
                it("shows the popup menu", function() {
                    expect(this.view.$(".menu")).not.toHaveClass("hidden");
                });

                describe("clicking on the link again", function() {
                    it("closes the popup menu", function() {
                        this.view.$("a.popup").click();
                        expect(this.view.$(".menu")).toHaveClass("hidden");
                    });
                });

                describe("clicking on an option", function() {
                    beforeEach(function() {
                        this.choiceSpy = jasmine.createSpy("choice");
                        this.view.bind("choice", this.choiceSpy);
                        this.view.$(".menu li[data-type=joanne] a").click();
                    });
                    it("should trigger a choice event with the data", function(){
                        expect(this.choiceSpy).toHaveBeenCalledWith("alice");
                    });
                    it("should set the chosen property", function(){
                        expect(this.view.options.chosen).toBe("alice")
                    });
                    it("should display the new choice", function(){
                        expect(this.view.$(".popup .chosen")).toHaveText("alice")
                    })
                });

            })
        })
    });

});