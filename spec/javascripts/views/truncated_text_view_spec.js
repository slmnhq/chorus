describe("chorus.views.TruncatedText", function() {
    beforeEach(function() {
        this.loadTemplate("truncated_text");
        fixtures.model = "Workspace"
        this.model = fixtures.modelFor("fetch");
    });

    describe("#render", function() {
        context("when the model is not yet loaded", function() {
            beforeEach(function() {
                this.model.loaded = undefined;
                this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", length : 20 })
                this.view.render();
            })

            it("renders nothing", function() {
                expect($(this.view.el).text().trim()).toBe("");
            })
        })

        context("after the model is loaded", function() {
            context("when the text has equal to or greater than the maximum number of characters", function() {
                beforeEach(function() {
                    this.text = "Now is the time for all good men to come to the aid of their country";
                    this.model.set({ summary : this.text });
                    this.displayText = this.text.substring(0, 20)
                    this.truncatedText = this.text.substring(20);
                    this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", length : 20 })
                    this.view.render();
                })

                it("truncates the text", function() {
                    expect(this.view.$(".text").text()).toBe(this.displayText);
                })

                it("renders the truncated text", function() {
                    expect(this.view.$(".truncated").text()).toBe(this.truncatedText)
                })

                it("does not add space between displayText and truncatedText", function() {
                    expect(this.view.$(".entire_text").text()).toBe(this.text);
                });

                it("renders 'read more' and 'read less' links", function() {
                    expect(this.view.$(".links a.more")).toExist();
                    expect(this.view.$(".links a.less")).toExist();
                    expect(this.view.$(".links a.more").text().trim()).toMatchTranslation("truncated_text.more");
                    expect(this.view.$(".links a.less").text().trim()).toMatchTranslation("truncated_text.less");
                })

                it("starts out without the 'more' class on the surrounding div", function() {
                    expect(this.view.$("> div")).not.toHaveClass("more");
                });
            })
            context("when the text has less than the maximum number of characters", function() {
                beforeEach(function() {
                    this.text = "Now is the time for all good men to come to the aid of their country";
                    this.model.set({ summary : this.text });
                    this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", length : 200 })
                    this.view.render();
                })

                it("renders the bare text", function() {
                    expect($(this.view.el).text().trim()).toBe(this.text);
                })
            })
        });

        context("when the attribute does not exist on the model", function() {
            beforeEach(function() {
                this.view = new chorus.views.TruncatedText({model: this.model, attribute: "herpderp", length : 200 })
                this.view.render();
            })

            it("renders nothing", function() {
                expect($(this.view.el).text().trim()).toBe("");
            })
        });
    })

    describe("expanding and contracting truncated text", function() {
        beforeEach(function() {
            this.text = "Now is the time for all good men to come to the aid of their country";
            this.model.set({ summary : this.text });
            this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", length : 20 })
            this.view.render();
        })

        describe("clicking 'read more'", function() {
            beforeEach(function() {
                this.view.$("a.more").click();
            })

            it("adds the 'more' class to the surrounding div", function() {
                expect(this.view.$("> div")).toHaveClass("more");
            })

            describe("clicking 'read less'", function() {
                beforeEach(function() {
                    this.view.$("a.less").click();
                })

                it("removes the 'more' class from the surrounding div", function() {
                    expect(this.view.$("> div")).not.toHaveClass("more");
                })

                context("when the view re-renders", function() {
                    beforeEach(function() {
                        this.view.render();
                    });

                    it("still does not have the 'more' class on the surrounding div", function() {
                        expect(this.view.$("> div")).not.toHaveClass("more");
                    });
                });
            })

            context("when the view re-renders", function() {
                beforeEach(function() {
                    this.view.render();
                });

                it("retains the more class on the surrounding div", function() {
                    expect(this.view.$("> div")).toHaveClass("more");
                });
            });
        })
    })
})