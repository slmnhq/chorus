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
                    ],
                    title: "Link Menu",
                    event : "name"
                })
                this.view.render();
            })

            it("contains a filter menu", function() {
                expect(this.view.$(".menu.popup_filter")).toExist();
                expect(this.view.$(".title")).toHaveText("Link Menu");
            });

            it("should have the correct popup options", function() {
                expect(this.view.$("li[data-type=mark] a")).toHaveText("bob")
                expect(this.view.$("li[data-type=joanne] a")).toHaveText("alice")
            })

            describe("chosen option", function() {
                it("defaults to the first option", function() {
                    expect(this.view.$(".chosen")).toHaveText("bob")
                    expect(this.view.$(".menu li[data-type=mark] .check")).not.toHaveClass("hidden");
                    expect(this.view.$(".menu li[data-type=joanne] .check")).toHaveClass("hidden")

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

            describe("clicking the chosen option", function() {
                beforeEach(function() {
                    this.view.$("a.popup span").click();
                });

                it("shows the popup menu", function() {
                    expect(this.view.$(".menu")).not.toHaveClass("hidden");
                });
            });

            describe("clicking the popup link", function() {
                beforeEach(function() {
                    this.popupSpy = jasmine.createSpy();
                    $(document).bind("chorus:menu:popup", this.popupSpy);
                    this.view.$("a.popup").click();
                });

                it("shows the popup menu", function() {
                    expect(this.view.$(".menu")).not.toHaveClass("hidden");
                });

                it("triggers chorus:menu:popup on the document", function() {
                    expect(this.popupSpy).toHaveBeenCalled();
                })

                describe("clicking on the link again", function() {
                    beforeEach(function() {
                        this.view.$("a.popup").click();
                    })

                    it("closes the popup menu", function() {
                        expect(this.view.$(".menu")).toHaveClass("hidden");
                    });
                });

                describe("clicking on an option", function() {
                    beforeEach(function() {
                        this.choiceSpy = jasmine.createSpy("choice");
                        this.view.bind("choice", this.choiceSpy);
                        this.view.$(".menu li[data-type=joanne] a").click();
                    });

                    it("should trigger a choice event with the data", function() {
                        expect(this.choiceSpy).toHaveBeenCalledWith("name", "joanne");
                    });

                    it("should set the chosen property", function() {
                        expect(this.view.options.chosen).toBe("alice")
                    });

                    it("should display the new choice", function() {
                        expect(this.view.$(".popup .chosen")).toHaveText("alice")
                    })

                    it("shows change what is checked", function() {
                        expect(this.view.$(".menu li[data-type=mark] .check")).toHaveClass("hidden")
                        expect(this.view.$(".menu li[data-type=joanne] .check")).not.toHaveClass("hidden")
                    });
                });
            })

            describe("chorus:menu:popup handling", function() {
                beforeEach(function() {
                    this.view.$("a.popup").click();
                    expect(this.view.$(".menu")).not.toHaveClass("hidden");
                    $(document).trigger("chorus:menu:popup", $(""));
                })

                it("dismisses the popup", function() {
                    expect(this.view.$(".menu")).toHaveClass("hidden");
                })
            })
        })
    });
});