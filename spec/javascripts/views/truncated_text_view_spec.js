describe("chorus.views.TruncatedText", function() {
    beforeEach(function() {
        this.text = '<span style="font-weight: normal; ">This is&nbsp;</span><div><span style="font-weight: normal;"><br></span>' +
            '</div><div><span style="font-weight: normal;"><br></span></div><div><span style="font-weight: normal; "><br></span>' +
            '</div><div><span style="font-weight: normal; ">some </span><b>great</b> stuff <div style="font-weight: normal; "><ul>' +
            '<li><span style="font-size: 10pt; ">one</span></li><li><span style="font-size: 10pt; ">two</span></li><li>' +
            '<span style="font-size: 10pt;">three</span> </li></ul><a href="http://example.com">hi</a></div></div>';
        this.model = fixtures.workspace({ summary: this.text })
        this.model.loaded = true;
        this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary"})
    });

    describe("#render", function() {
        context("when the model is not yet loaded", function() {
            beforeEach(function() {
                this.model.loaded = undefined;
                this.view.render();
            })

            it("renders nothing", function() {
                expect($(this.view.el).text().trim()).toBe("");
            })
        })

        context("after the model is loaded", function() {
            beforeEach(function() {
                this.parent = $("<div/>")
                $('#jasmine_content').append(this.parent ).css("width", "200px")
                this.view.el = this.parent;
                this.view.render();
            })

            it("renders the text", function() {
                expect(this.view.$(".original").html()).toBe(this.text);
            });

            context("when the text height is greater than two lines", function() {
                it("marks the view as expandable", function() {
                    expect($(this.view.el)).toHaveClass('expandable');
                });
            });

            context("when the text height is less than or equal to two lines", function() {
                beforeEach(function() {
                    this.model.set({ summary: "This is <br/>a test"})
                });

                it("marks the view as not expandable", function() {
                    expect($(this.view.el)).not.toHaveClass('expandable');
                });
            });

            it("renders 'read more' and 'read less' links", function() {
                expect(this.view.$(".links a.more").text().trim()).toMatchTranslation("truncated_text.more");
                expect(this.view.$(".links a.less").text().trim()).toMatchTranslation("truncated_text.less");
            })

            it("is not expanded", function() {
                expect($(this.view.el)).not.toHaveClass('expanded');
            })
        });
    })

    describe("expanding and contracting truncated text", function() {
        beforeEach(function() {
            this.view.render();
        })

        describe("clicking 'read more'", function() {
            beforeEach(function() {
                this.view.$("a.more").click();
            })

            it("adds the 'expanded' class to the .truncated_text element", function() {
                expect($(this.view.el)).toHaveClass('expanded');
            })

            describe("clicking 'read less'", function() {
                beforeEach(function() {
                    this.view.$("a.less").click();
                })

                it("removes the 'expanded' class to the .truncated_text element", function() {
                    expect($(this.view.el)).not.toHaveClass('expanded');
                })
            })
        })
    })

    describe("clicking links in the text", function() {
        beforeEach(function() {
            spyOn(window, "open")
            this.view.render();
            this.view.$(".original a").click();
        });

        it("opens the link in a new window", function() {
            expect(window.open).toHaveBeenCalledWith("http://example.com")
        });
    });
})
