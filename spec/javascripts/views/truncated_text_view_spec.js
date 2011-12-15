
describe("chorus.views.TruncatedText", function() {
    beforeEach(function() {
        fixtures.model = "Workspace"
        this.model = fixtures.modelFor("fetch");
    });

    describe("#render", function() {
        context("when the model is not yet loaded", function() {
            beforeEach(function() {
                this.model.loaded = undefined;
                this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters : 20 })
                this.view.render();
            })

            it("renders nothing", function() {
                expect($(this.view.el).text().trim()).toBe("");
            })
        })

        context("after the model is loaded", function() {
            context("when there is no maximum number of lines", function() {
                context("when the text has equal to or greater than the maximum number of characters", function() {
                    beforeEach(function() {
                        this.text = "Now is the time for all good men to come to the aid of their country";
                        this.model.set({ summary : this.text });
                        this.displayText = this.text.substring(0, 20)
                        this.truncatedText = this.text.substring(20);
                        this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters : 20 })
                        this.view.render();
                    })

                    it("truncates the text", function() {
                        expect(this.view.$(".text").text()).toBe(this.displayText);
                    })

                    it("renders the truncated text", function() {
                        expect(this.view.$(".truncated").text()).toBe(this.truncatedText)
                    })

                    it("does not add space between displayText and truncatedText", function() {
                        expect(this.view.$(".entire_text .text, .entire_text .truncated").text()).toBe(this.text);
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
                        this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters : 200 })
                        this.view.render();
                    })

                    it("renders the bare text", function() {
                        expect($(this.view.el).text().trim()).toBe(this.text);
                    })
                })
            });

            context("with a maximum number of lines", function() {
                beforeEach(function() {
                    function textRegularize(str) {
                        if ($.browser.msie) {
                            // IE8 removes all leading whitespace, compresses any other whitespace
                            return str.replace(/^\s+/, '').replace(/\s+/g, ' ');
                        } else {
                            return str;
                        }
                    }

                    this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters : 20, lines: 2 })
                    this.view.render();
                    this.expectSimilarStrings = function(expectedDisplay, expectedTruncated) {
                        var truncated = this.view.truncate(this.view.model.get("summary"), 20, 2);
                        expect(truncated[0]).toBe(expectedDisplay);
                        expect(truncated[1]).toBe(expectedTruncated);
                        expect(textRegularize(this.view.$(".text").text())).toBe(textRegularize(expectedDisplay));
                        expect(textRegularize(this.view.$(".truncated").text())).toBe(textRegularize(expectedTruncated));
                    }
                });

                context("when the text has less than the maximum number of characters", function() {
                    context("when the text has less than or equal to the maximum number of lines", function() {
                        beforeEach(function() {
                            this.model.set({summary : "really short"});
                        });

                        it("renders the bare text", function() {
                            expect($(this.view.el).text().trim()).toBe("really short");
                        })
                    });

                    context("when the text has more than the maximum number of lines", function() {
                        beforeEach(function() {
                            this.model.set({summary : "1\n2\n3\n"});
                        });

                        it("renders as expected", function() {
                            this.expectSimilarStrings("1\n2", "\n3\n");
                        });
                    });
                });

                context("when the text has more than the maximum number of characters", function() {
                    context("when the text has less than or equal to the maximum number of lines", function() {
                        beforeEach(function() {
                            this.model.set({summary : "1234567890123456789012345"});
                        });

                        it("renders as expected", function() {
                            this.expectSimilarStrings("12345678901234567890", "12345");
                        });
                    });

                    context("when the text has more than the maximum number of lines", function() {
                        context("when the character limit is reached before the line limit", function() {
                            beforeEach(function() {
                                this.model.set({summary : "123456789012\n4567890AB\nC\nD\nE"});
                            });

                            it("renders as expected", function() {
                                this.expectSimilarStrings("123456789012\n4567890", "AB\nC\nD\nE");
                            });
                        });

                        context("when the line limit is reached before the character limit", function() {
                            beforeEach(function() {
                                this.model.set({summary : "12345\n6789012\n3456789012345"});
                            });

                            it("renders as expected", function() {
                                this.expectSimilarStrings("12345\n6789012", "\n3456789012345");
                            });
                        });
                    });
                });
            });
        });

        context("when the attribute does not exist on the model", function() {
            beforeEach(function() {
                this.view = new chorus.views.TruncatedText({model: this.model, attribute: "herpderp", characters : 200 })
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
            this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters : 20 })
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
