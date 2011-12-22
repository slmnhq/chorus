describe("jquery extensions", function() {
    describe("button extensions", function() {
        beforeEach(function() {
            this.button = $("<button>Original Text</button>");
        });

        it("returns false when #isLoading is called", function() {
           expect(this.button.isLoading()).toBeFalsy();
        });

        describe("startLoading", function() {
            beforeEach(function() {
                this.button.startLoading("test.deer");
            });

            it("sets the button's text to the supplied translation key", function() {
                expect(this.button.text()).toMatchTranslation("test.deer");
            });

            it("displays a spinner on the button", function() {
                expect(this.button.find("div[aria-role=progressbar]").length).toBe(1);
            });

            it("disables the button", function() {
                expect(this.button.attr("disabled")).toBe("disabled");
            });

            it("adds the expanded class to the button", function() {
                expect(this.button).toHaveClass("expanded");
            });

            it("returns true when #isLoading is called", function() {
               expect(this.button.isLoading()).toBeTruthy();
            });

            context("calling startLoading again", function() {
                beforeEach(function() {
                    this.button.startLoading("breadcrumbs.home");
                });

                it("does not change the text", function() {
                    expect(this.button.text()).toMatchTranslation("test.deer");
                });

                it("does not add another spinner", function() {
                    expect(this.button.find("div[aria-role=progressbar]").length).toBe(1);
                });

                it("still restores to the original text when stopLoading is called", function() {
                    this.button.stopLoading();
                    expect(this.button.text()).toBe("Original Text");
                });
            });

            describe("stopLoading", function() {
                beforeEach(function() {
                    this.button.stopLoading();
                });

                it("sets the button's text to the original value", function() {
                    expect(this.button.text()).toBe("Original Text");
                });

                it("removes the spinner from the button", function() {
                    expect(this.button.find("div[aria-role=progressbar]").length).toBe(0);
                });

                it("enables the button", function() {
                    expect(this.button).not.toHaveAttr("disabled")
                });

                it("removes the expanded class to the button", function() {
                    expect(this.button).not.toHaveClass("expanded");
                });

                it("returns false when #isLoading is called", function() {
                   expect(this.button.isLoading()).toBeFalsy();
                });
            });
        });
    });
});