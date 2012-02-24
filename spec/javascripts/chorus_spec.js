describe("chorus global", function() {
    beforeEach(function() {
        this.chorus = new Chorus();
        this.backboneSpy = spyOn(Backbone.history, "start")
    })

    describe("#initialize", function() {
        it("should start the Backbone history after the session has been set", function() {
            var self = this;
            expect(this.chorus.session).toBeUndefined();
            this.backboneSpy.andCallFake(function() {
                expect(self.chorus.session).toBeDefined();
            });
            this.chorus.initialize()
            expect(Backbone.history.start).toHaveBeenCalled();
        });

        it("should create a session", function() {
            this.chorus.initialize()
            expect(this.chorus.session).toBeDefined();
        });
    });

    describe("#afterNavigate", function() {
        beforeEach(function() {
            this.chorus.initialize();

            this.spy1 = jasmine.createSpy();
            this.spy2 = jasmine.createSpy();

            this.chorus.afterNavigate(this.spy1);
            this.chorus.afterNavigate(this.spy2);
        });

        it("calls the supplied functions after the router triggers leaving", function() {
            expect(this.spy1).not.toHaveBeenCalled();
            expect(this.spy2).not.toHaveBeenCalled();

            this.chorus.router.trigger("leaving");

            expect(this.spy1).toHaveBeenCalled();
            expect(this.spy2).toHaveBeenCalled();

            this.spy1.reset();
            this.spy2.reset();

            this.chorus.router.trigger("leaving");

            expect(this.spy1).not.toHaveBeenCalled();
            expect(this.spy2).not.toHaveBeenCalled();
        })
    })

    describe("#toast", function() {
        beforeEach(function() {
            spyOn($, 'jGrowl');
        });

        it("accepts a translation string", function() {
            chorus.toast("test.mouse");
            expect($.jGrowl).toHaveBeenCalledWith(t("test.mouse"), {life: 5000, sticky: false});
        });

        it("accepts a translation string with arguments", function() {
            chorus.toast("test.with_param", {param: "Dennis"});
            expect($.jGrowl).toHaveBeenCalledWith("Dennis says hi", {life: 5000, sticky: false});
        });

        it("accepts toastOpts in the options hash", function() {
            chorus.toast("test.with_param", { param: "Nobody", toastOpts: {sticky: true, foo: "bar"}});
            expect($.jGrowl).toHaveBeenCalledWith("Nobody says hi", {life: 5000, sticky: true, foo: "bar"});
        });
    });

    describe("#placeholder", function() {
        it("wraps jquery.placeholder", function() {
            spyOn($.fn, 'placeholder');
            var input = $("<input/>");
            input.placeholder();
            expect($.fn.placeholder).toHaveBeenCalledOn(input);
        });
    });

    describe("#menu", function() {
        beforeEach(function() {
            chorus._navigated();
            this.qtipElement = stubQtip();
            this.element = $("<div></div>");
            this.eventSpy = jasmine.createSpy();
            chorus.menu(this.element, {
                content: "menu content<a class='test_link'></a>",
                contentEvents: {
                    '.test_link': this.eventSpy
                }
            });
            this.qtipArgs = $.fn.qtip.mostRecentCall.args[0];
        })

        it("calls qtip on the given element", function() {
            expect($.fn.qtip.mostRecentCall.object.get(0)).toEqual(this.element.get(0));
        })

        it("passes down the given content", function() {
            expect(this.qtipArgs.content).toEqual("menu content<a class='test_link'></a>");
        })

        it("sets up the events on the contents", function() {
            this.element.click();
            this.qtipElement.find('.test_link').click()
            expect(this.eventSpy).toHaveBeenCalledWith(jasmine.any(jQuery.Event), this.element.data('qtip'));
        })

        context("event handling", function() {
            beforeEach(function() {
                this.element.click();
            })

            it("closes the qtip", function() {
                expect(this.qtipElement).toHaveVisibleQtip();
                this.qtipElement.find('.test_link').click()
                expect(this.qtipElement).not.toHaveVisibleQtip();
            });
        })

        it("sets up our menu styling", function() {
            expect(this.qtipArgs.show.event).toEqual('click');
            expect(this.qtipArgs.hide).toEqual('unfocus');
            expect(this.qtipArgs.position.my).toEqual("top center")
            expect(this.qtipArgs.position.at).toEqual("bottom center")
            expect(this.qtipArgs.style).toEqual({
                classes: "tooltip-white",
                tip: {
                    mimic: "top center",
                    width: 20,
                    height: 15
                }
            });
        });

        context("after navigating away", function() {
            beforeEach(function() {
                spyOn($.fn, 'remove');

                chorus._navigated();
            });

            it("calls $.fn.remove on the menu element", function() {
                expect($.fn.remove.mostRecentCall.object.get(0)).toEqual(this.element.get(0));
            })
        })
    });

    describe("#datePicker(element)", function() {
        beforeEach(function() {
            spyOn(datePickerController, 'createDatePicker');
            this.input1 = $("<input></input");
            this.input2 = $("<input></input");
            this.input3 = $("<input></input");
            chorus.datePicker({
                "%d": this.input1,
                "%m": this.input2,
                "%Y": this.input3
            });

            this.id1 = this.input1.attr("id"),
            this.id2 = this.input2.attr("id"),
            this.id3 = this.input3.attr("id");
        });

        it("gives the elements unique ids", function() {
            expect(this.id1).toBeA("string");
            expect(this.id2).toBeA("string");
            expect(this.id3).toBeA("string");
        });

        it("calls datePickerController with the right unique ids and format strings", function() {
            expect(datePickerController.createDatePicker).toHaveBeenCalled();

            var datePickerParams = datePickerController.createDatePicker.mostRecentCall.args[0];
            expect(datePickerParams.formElements[this.id1]).toBe("%d");
            expect(datePickerParams.formElements[this.id2]).toBe("%m");
            expect(datePickerParams.formElements[this.id3]).toBe("%Y");
        });
    });

    describe("fileIconUrl", function() {
        function verifyUrl(fileType, fileName) {
            expect(chorus.urlHelpers.fileIconUrl(fileType)).toBe("/images/workfiles/large/" + fileName + ".png");
        }

        it("maps known fileTypes to URLs correctly", function() {
            verifyUrl("C", "c");
            verifyUrl("c++", "cpp");
            verifyUrl("cc", "cpp");
            verifyUrl("cxx", "cpp");
            verifyUrl("cpp", "cpp");
            verifyUrl("csv", "csv");
            verifyUrl("doc", "doc");
            verifyUrl("excel", "xls");
            verifyUrl("h", "c");
            verifyUrl("hpp", "cpp");
            verifyUrl("hxx", "cpp");
            verifyUrl("jar", "jar");
            verifyUrl("java", "java");
            verifyUrl("pdf", "pdf");
            verifyUrl("ppt", "ppt");
            verifyUrl("r", "r");
            verifyUrl("rtf", "rtf");
            verifyUrl("sql", "sql");
            verifyUrl("txt", "txt");
            verifyUrl("docx", "doc");
            verifyUrl("xls", "xls");
            verifyUrl("xlsx", "xls");
        });

        it("maps unknown fileTypes to plain.png", function() {
            verifyUrl("foobar", "plain");
            verifyUrl("N/A", "plain");
        });

        it("defaults to large size", function() {
            expect(chorus.urlHelpers.fileIconUrl("C")).toBe("/images/workfiles/large/c.png");
        })

        it("takes an optional size override", function() {
            expect(chorus.urlHelpers.fileIconUrl("C", "medium")).toBe("/images/workfiles/medium/c.png");
        })

        it("returns 'plain' when null is passed", function() {
            verifyUrl(undefined, "plain");
        });
    });

    describe("resizing the window", function() {
        beforeEach(function () {
            spyOn(_, "debounce").andCallFake(function(func) {
                return func;
            });
            this.chorus.bindGlobalCallbacks();

            this.page1 = new chorus.pages.Base();
            this.page2 = new chorus.pages.Base();

            this.chorus.page = new chorus.pages.Base();

            spyOnEvent(this.page1, "resized")
            spyOnEvent(this.page2, "resized")
            spyOnEvent(this.chorus.page, "resized")
            $(window).resize();
        });

        it("should not trigger resized on the anonymous pages, because those pages aren't the active page", function() {
            expect("resized").not.toHaveBeenTriggeredOn(this.page1);
            expect("resized").not.toHaveBeenTriggeredOn(this.page2);
        })

        it("should trigger resized on chorus.page", function() {
            expect("resized").toHaveBeenTriggeredOn(this.chorus.page);
        })
    })

    describe("#search", function() {
        beforeEach(function() {
            this.input = $("<input></input>");
            this.list = $("<ul></ul>");
            _.each(["joseph", "max", "nitin"], function(name) {
                $("<li></li>").append('<div class="name">' + name + '</div>').append('<div>add</div>').appendTo(this.list);
            }, this);

        });

        context("with a selector", function() {
            beforeEach(function() {
                chorus.search({ input: this.input, list: this.list, selector: ".name" });
            })

            describe("when text is entered in the search input", function() {
                it("hides elements in the list that do not contain the search string", function() {
                    this.input.val("nit").trigger("textchange");

                    expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(2)).not.toHaveClass("hidden");
                });

                it("only searches text within the selector", function() {
                    this.input.val("add").trigger("textchange");

                    expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(2)).toHaveClass("hidden");
                });
            });
        });

        context("without a selector", function() {
            beforeEach(function() {
                chorus.search({ input: this.input, list: this.list});
            })

            describe("when text is entered in the search input", function() {
                it("hides elements in the list that do not contain the search string", function() {
                    this.input.val("nit").trigger("textchange");

                    expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(2)).not.toHaveClass("hidden");
                });

            });
        });
    })

    describe("#help", function() {
        beforeEach(function() {
            spyOn(window, "FMCOpenHelp")
        });

        context("when the current page has a helpId", function() {
            beforeEach(function() {
                chorus.page = {
                    helpId: "foo"
                }

                chorus.help();
            });

            it("calls into the help system with the helpId", function() {
                expect(window.FMCOpenHelp).toHaveBeenCalledWith("foo");
            })
        })

        context("when the current page does not have a helpId", function() {
            beforeEach(function() {
                chorus.page = {
                }

                chorus.help();
            });

            it("calls into the help system with 'home'", function() {
                expect(window.FMCOpenHelp).toHaveBeenCalledWith("home");
            })
        })
    })
});
