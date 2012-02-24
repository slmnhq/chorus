describe("jquery extensions", function() {
    describe("loading", function() {
        beforeEach(function() {
            var container = $("<div/>");
            _.times(5, function(i) {
                container.append("<button>Original Text " + i + "</button>");
            });
            container.append("<span>Original Span Text</span>")
            this.buttons = container.find("button");
            this.button = this.buttons.eq(0);
            this.span = container.find("span").eq(0);
        });

        context("when #startLoading has not yet been called", function() {
            describe("#isLoading", function() {
                it("returns false", function() {
                    expect(this.button.isLoading()).toBeFalsy();
                });
            });

            describe("#stopLoading", function() {
                it("doesn't modify the text", function() {
                    this.button.stopLoading();
                    expect(this.button.text()).toBe("Original Text 0");
                });
            })
        });

        describe("startLoading", function() {
            beforeEach(function() {
                this.buttons.startLoading("test.mouse");
                this.span.startLoading("test.mouse")
            });

            it("sets the elements's text to the supplied translation key", function() {
                expect(this.button.text()).toMatchTranslation("test.mouse");
                expect(this.span.text()).toMatchTranslation("test.mouse")
            });

            it("displays a spinner inside the element", function() {
                expect(this.button.find("div[aria-role=progressbar]").length).toBe(1);
                expect(this.span.find("div[aria-role=progressbar]").length).toBe(1);
            });

            it("disables buttons", function() {
                expect(this.button.attr("disabled")).toBe("disabled");
            });

            it("does not disable non-buttons", function() {
                expect(this.span).not.toHaveAttr("disabled");
            });

            it("adds the is_loading class to the element", function() {
                expect(this.button).toHaveClass("is_loading");
                expect(this.span).toHaveClass("is_loading");
            });

            context("calling startLoading again", function() {
                beforeEach(function() {
                    this.button.startLoading("breadcrumbs.home");
                });

                it("does not change the text", function() {
                    expect(this.button.text()).toMatchTranslation("test.mouse");
                });

                it("does not add another spinner", function() {
                    expect(this.button.find("div[aria-role=progressbar]").length).toBe(1);
                });

                it("still restores to the original text when stopLoading is called", function() {
                    this.button.stopLoading();
                    expect(this.button.text()).toBe("Original Text 0");
                });
            });

            describe("stopLoading", function() {
                beforeEach(function() {
                    this.buttons.stopLoading();
                    this.span.stopLoading();
                });

                it("sets each elements's text to the original value", function() {
                    expect(this.buttons.eq(0).text()).toBe("Original Text 0");
                    expect(this.buttons.eq(1).text()).toBe("Original Text 1");
                    expect(this.span.text()).toBe("Original Span Text");
                });

                it("removes the spinner from each element", function() {
                    expect(this.buttons.find("div[aria-role=progressbar]").length).toBe(0);
                    expect(this.span.find("div[aria-role=progressbar]")).not.toExist();
                });

                it("enables buttons", function() {
                    expect(this.buttons.eq(0)).not.toHaveAttr("disabled")
                    expect(this.buttons.eq(1)).not.toHaveAttr("disabled")
                });

                it("removes the loading class from the elements", function() {
                    expect(this.buttons.eq(0)).not.toHaveClass("loading");
                    expect(this.buttons.eq(1)).not.toHaveClass("loading");
                    expect(this.span).not.toHaveClass("loading")
                });
            });
        });

        describe("#isLoading", function() {
            it("returns true when the first element in the collection is loading", function() {
                this.buttons.eq(0).startLoading();
                expect(this.buttons.isLoading()).toBeTruthy();
            });

            it("returns false when the first element in the collection is not loading", function() {
                this.buttons.startLoading();
                this.buttons.eq(0).stopLoading();
                expect(this.buttons.isLoading()).toBeFalsy();
            });
        });
    });

    describe("#hasQtip", function() {
        it("returns true for a single item on which qtip has been called", function() {
            var doc = '<div> <span class="foo"/> </div>';
            var item = $('.foo', doc);
            item.qtip({content: 'Qtip2 requires content in the tooltip'});
            expect(item.length).toBe(1);
            expect(item.hasQtip()).toBeTruthy();
        });

        it("returns true for multiple items on which qtip has been called", function() {
            var doc = $('<div> <span class="foo"/><span class="bar"/></div>');
            var item1 = $('.foo', doc);
            item1.qtip({content: 'Qtip2 requires content in the tooltip'});
            var item2 = $('.bar', doc);
            item2.qtip({content: 'Qtip2 requires content in the tooltip'});
            expect($('span', doc).length).toBe(2);
            expect($('span', doc).hasQtip()).toBeTruthy();
        });

        it("returns false for an object that was qtipped and then qtip('destroy')ed", function() {
            var doc = $('<div> <span class="foo"/><span class="bar"/></div>');
            var item1 = $('.foo', doc);
            item1.qtip({content: 'Qtip2 requires content in the tooltip'});
            // qtip('destroy') clears the form, removeData clears the objects -- need to call both
            item1.qtip('destroy');
            item1.removeData("qtip");
            expect(item1.hasQtip()).toBeFalsy();
        });

        it("returns false for an empty jQuery collection", function() {
            expect($().hasQtip()).toBeFalsy();
        });

        it("returns false for multiple items where not all have had qtip called", function() {
            var doc = '<div> <span class="foo"/><span class="bar"/></div>';
            var item1 = $('.foo', doc);
            item1.qtip({content: 'Qtip2 requires content in the tooltip '});
            expect($('span', doc).length).toBe(2);
            expect($('span', doc).hasQtip()).toBeFalsy();
        });
    });

    describe("#isOnDom", function() {
        it("should be true if element is on the dom", function() {
            var stuff = $("<div class='stuff'></div>")
            $('#jasmine_content').append(stuff)
            expect(stuff.isOnDom()).toBeTruthy();
        })

        it("should be false if element is not on the dom", function() {
            var stuff = $("<div class='stuff'></div>")
            expect(stuff.isOnDom()).toBeFalsy();
        })
    });

    describe("#outerHtml", function() {
        it("converts the first element to html", function() {
            var el = $("<a></a>").addClass("author");
            var html = el.outerHtml();
            var $html = $(html);

            // Coding like weirdos here to make IE8 happy
            expect(_.isString(html)).toBeTruthy();
            expect($html.is("a")).toBeTruthy();
            expect($html).toHaveClass("author");
        });
    });

    describe("#stripHtml", function() {
        it("removes html tags from a string", function() {
            expect($.stripHtml("Hello <span>how are</span> you")).toBe("Hello how are you")
        });
    });
});
