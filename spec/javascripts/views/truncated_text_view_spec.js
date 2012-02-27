describe("chorus.views.TruncatedText", function() {
    beforeEach(function() {
        fixtures.model = "Workspace"
        this.model = fixtures.modelFor("fetch");
    });

    describe("#render", function() {
        context("when the model is not yet loaded", function() {
            beforeEach(function() {
                this.model.loaded = undefined;
                this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters: 20 })
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
                        this.model.set({ summary: this.text });
                        this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters: 20 })
                        this.view.render();
                    })

                    it("renders the truncated text", function() {
                        expect(this.view.$(".text_content").text()).toBe("Now is the time for ");
                    })

                    it("renders 'read more' and 'read less' links", function() {
                        expect(this.view.$(".links a.more")).not.toHaveClass("hidden");
                        expect(this.view.$(".links a.less")).toHaveClass("hidden");
                        expect(this.view.$(".links a.more").text().trim()).toMatchTranslation("truncated_text.more");
                        expect(this.view.$(".links a.less").text().trim()).toMatchTranslation("truncated_text.less");
                    })
                })

                context("when the text has less than the maximum number of characters", function() {
                    beforeEach(function() {
                        this.text = "Now is the time for all good men to come to the aid of their country";
                        this.model.set({ summary: this.text });
                        this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters: 200 })
                        this.view.render();
                    })

                    it("renders all of the text", function() {
                        expect(this.view.$(".text_content").text()).toBe(this.text);
                    })
                })

                context("when the content has HTML tags", function() {
                    beforeEach(function() {
                        this.model.set({summary: "<ul><li><b>One</b></li><li><b>Duo</b></li><li><b>Drei</b></li></ul>"});
                        this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters: 20 })
                        this.view.render();
                    });

                    it("does not show half a tag", function() {
                        expect(this.view.$(".text_content").html()).toBe("<ul><li><b>One</b></li></ul>");
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

                    this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters: 20, lines: 2 })
                    this.view.render();
                });

                context("when the text has less than the maximum number of characters", function() {
                    context("when the text has less than or equal to the maximum number of lines", function() {
                        beforeEach(function() {
                            this.model.set({summary: "really short"});
                        });

                        it("renders all of the text", function() {
                            expect(this.view.$(".text_content").text().trim()).toBe("really short");
                        })
                    });

                    context("when the text has more than the maximum number of lines", function() {
                        beforeEach(function() {
                            this.model.set({summary: "1\n2\n3\n"});
                        });

                        it("renders as expected", function() {
                            expect(this.view.$(".text_content").text()).toBe("1\n2");
                        });
                    });
                });

                context("when the text has more than the maximum number of characters", function() {
                    context("when the text has less than or equal to the maximum number of lines", function() {
                        beforeEach(function() {
                            this.model.set({summary: "1234567890123456789012345"});
                        });

                        it("renders all of the text", function() {
                            expect(this.view.$(".text_content").text()).toBe("12345678901234567890");
                        });
                    });

                    context("when the text has more than the maximum number of lines", function() {
                        context("when the character limit is reached before the line limit", function() {
                            beforeEach(function() {
                                this.model.set({summary: "123456789012\n4567890AB\nC\nD\nE"});
                            });

                            it("renders the truncated text", function() {
                                expect(this.view.$(".text_content").text()).toBe("123456789012\n4567890");
                            });
                        });

                        context("when the line limit is reached before the character limit", function() {
                            beforeEach(function() {
                                this.model.set({summary: "12345\n6789012\n3456789012345"});
                            });

                            it("renders the truncated text", function() {
                                expect(this.view.$(".text_content").text()).toBe("12345\n6789012");
                            });
                        });
                    });
                });
            });
        });

        context("when the attribute does not exist on the model", function() {
            beforeEach(function() {
                this.view = new chorus.views.TruncatedText({model: this.model, attribute: "herpderp", characters: 200 })
                this.view.render();
            })

            it("renders nothing", function() {
                expect(this.view.$(".text_content").text()).toBe("");
            })
        });
    })

    describe("expanding and contracting truncated text", function() {
        beforeEach(function() {
            this.text = "Now is the time for all good men to come to the aid of their country";
            this.model.set({ summary: this.text });
            this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", characters: 20 })
            this.view.render();
        })

        describe("clicking 'read more'", function() {
            beforeEach(function() {
                this.view.$("a.more").click();
            })

            it("displays the full text", function() {
                expect(this.view.$(".text_content").text()).toBe(this.text);
            })

            it("hides the 'read more' link", function() {
                expect(this.view.$("a.more")).toHaveClass('hidden');
            })

            it("shows the 'read less' link", function() {
                expect(this.view.$("a.less")).not.toHaveClass('hidden');
            })

            describe("clicking 'read less'", function() {
                beforeEach(function() {
                    this.view.$("a.less").click();
                })

                it("display the truncated text", function() {
                    expect(this.view.$(".text_content").text()).toBe("Now is the time for ")
                })

                it("shows the 'read more' link", function() {
                    expect(this.view.$("a.more")).not.toHaveClass('hidden');
                })

                it("hides the 'read less' link", function() {
                    expect(this.view.$("a.less")).toHaveClass('hidden');
                })
            })
        })
    })
 
    describe("#truncate", function() {
        beforeEach(function() {
            this.view = new chorus.views.TruncatedText();
        });

        it("should handle no truncation", function() {
            expect(this.view.truncate("<b>One</b>", 30, undefined)).toBe("<b>One</b>");
        });

        it("should handle truncating to zero", function() {
            expect(this.view.truncate("<b>One</b>", 0, undefined)).toBe("");
        });

        it("should not truncate in the middle of a tag", function() {
            expect(this.view.truncate("<i>Foo</i><b>Bar</b>", 8, undefined)).toBe("<i>Foo");
        });

        it("should handle nested tags", function() {
            expect(this.view.truncate("<ul><li>One</li><li>Two</li></ul>", 18, undefined)).toBe("<ul><li>One</li>");
        });

        it("should not truncate the text after a tag", function() {
            expect(this.view.truncate("<i>Foo</i><b>Bar</b>Hello how are you", 33, undefined)).toBe("<i>Foo</i><b>Bar</b>Hello how are");
        });
    });
})
