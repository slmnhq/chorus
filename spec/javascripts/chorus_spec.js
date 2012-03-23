describe("chorus global", function() {
    beforeEach(function() {
        this.chorus = new Chorus();
        this.backboneSpy = spyOn(Backbone.history, "start")
    })

    if (chorus.isDevMode()) {
        describe(".classExtend", function() {
            it("creates a constructor with the given name", function() {
                var SomeClass = chorus.models.Base.extend({
                    constructorName: "Foo"
                });

                expect(SomeClass.name).toBe("chorus$Foo");
            });
        });
    }

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

        it("should set the workfileDir property", function() {
            this.chorus.initialize();
            expect(this.chorus.workfileDir).toBe("ofbiz/runtime/data/workfile");
        });
    });

    describe("#afterNavigate", function() {
        beforeEach(function() {
            this.chorus.initialize();

            this.spy1 = jasmine.createSpy();
            this.spy2 = jasmine.createSpy();

            this.chorus.afterNavigate(this.spy1);
            this.chorus.afterNavigate(this.spy2);

            spyOn(this.chorus.PageEvents, "reset");
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

        it("calls chorus.PageEvents.reset after the router triggers leaving", function() {
            this.chorus.router.trigger("leaving");
            expect(this.chorus.PageEvents.reset).toHaveBeenCalled();
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
        context("when the menu is in a modal", function() {
            beforeEach(function() {
                chorus._navigated();
                this.qtipElement = stubQtip();
                this.element = $("<div class='dialog'></div>");
                this.eventSpy = jasmine.createSpy();
                chorus.menu(this.element, {
                    content: "menu content<a class='test_link'></a>",
                    contentEvents: {
                        '.test_link': this.eventSpy
                    }
                });
                this.qtipArgs = $.fn.qtip.mostRecentCall.args[0];
            })

            it("should have the tooltip-modal class", function() {
                expect(this.qtipArgs.style).toEqual({
                    classes: "tooltip-white tooltip-modal",
                    tip: {
                        mimic: "top center",
                        width: 20,
                        height: 15
                    }
                });
            });
        });

        context("when the menu is not in a modal", function() {
            beforeEach(function() {
                chorus._navigated();
                this.qtipElement = stubQtip();
                this.element = $("<div></div>");
                this.eventSpy = jasmine.createSpy();
                chorus.menu(this.element, {
                    content: "menu content<a class='test_link'></a>",
                    classes: "myClass",
                    mimic: "left center",
                    position: {
                        my: "left center",
                        at: "right center"
                    },
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
                expect(this.qtipArgs.position.my).toEqual("left center")
                expect(this.qtipArgs.position.at).toEqual("right center")
                expect(this.qtipArgs.style).toEqual({
                    classes: "myClass tooltip-white",
                    tip: {
                        mimic: "left center",
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
    });

    describe("#datePicker(element)", function() {
        beforeEach(function() {
            stubDefer();
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
            expect(datePickerParams.dragDisabled).toBeTruthy();
        });

        describe("disableBeforeToday", function() {
            beforeEach(function() {
                this.clock = sinon.useFakeTimers(new Date(2000, 11, 25).getTime(), "Date");
            });

            afterEach(function() {
                this.clock.restore();
            });

            it("disables the right dates when disableBeforeToday is passed in", function() {
                spyOn(datePickerController, "setDisabledDates");
                chorus.datePicker({
                    "%d": this.input1,
                    "%m": this.input2,
                    "%Y": this.input3
                }, {disableBeforeToday: true});

                expect(datePickerController.setDisabledDates).toHaveBeenCalledWith(this.input1.attr("id"), {"00000101" : "20001224"});
            });
        });
    });

    describe("resizing the window", function() {
        beforeEach(function() {
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
            this.input1 = $("<input></input>");
            this.input2 = $("<input></input>");
            this.list = $("<ul></ul>");
            this.container = $("<div></div>")
                .append(this.input1)
                .append(this.input2);

            _.each(["joseph", "max", "nitin"], function(name) {
                $("<li></li>").append('<div class="name">' + name + '</div>').append('<div>add</div>').appendTo(this.list);
            }, this);

        });

        it("adds the 'chorus_search' class to the input", function() {
            chorus.search({ input: this.input1, list: this.list });
            expect(this.input1).toHaveClass("chorus_search");
        });

        context("with a selector", function() {
            beforeEach(function() {
                chorus.search({ input: this.input1, list: this.list, selector: ".name" });
            })

            describe("when text is entered in the search input", function() {
                it("hides elements in the list that do not contain the search string", function() {
                    this.input1.val("nit").trigger("textchange");

                    expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(2)).not.toHaveClass("hidden");
                });

                it("only searches text within the selector", function() {
                    this.input1.val("add").trigger("textchange");

                    expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(2)).toHaveClass("hidden");
                });
            });
        });

        context("without a selector", function() {
            beforeEach(function() {
                chorus.search({ input: this.input1, list: this.list});
            })

            describe("when text is entered in the search input", function() {
                it("hides elements in the list that do not contain the search string", function() {
                    this.input1.val("nit").trigger("textchange");

                    expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                    expect(this.list.find("li").eq(2)).not.toHaveClass("hidden");
                });

            });
        });

        describe("when there is more than one element in the 'input' jquery array", function() {
            beforeEach(function() {
                chorus.search({ input: this.container.find("input"), list: this.list});
                this.wrapperDivs = this.container.find(".chorus_search_container");
            });

            it("uses the text from the most recently changed input to filter the list", function() {
                this.input1.val("ma").trigger("textchange");

                expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                expect(this.list.find("li").eq(1)).not.toHaveClass("hidden");
                expect(this.list.find("li").eq(2)).toHaveClass("hidden");

                this.input2.val("jo").trigger("textchange");

                expect(this.list.find("li").eq(0)).not.toHaveClass("hidden");
                expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                expect(this.list.find("li").eq(2)).toHaveClass("hidden");

                this.input1.val("nit").trigger("textchange");

                expect(this.list.find("li").eq(0)).toHaveClass("hidden");
                expect(this.list.find("li").eq(1)).toHaveClass("hidden");
                expect(this.list.find("li").eq(2)).not.toHaveClass("hidden");
            });

            it("adds a clear button to each input", function() {
                expect(this.wrapperDivs.length).toBe(2);
                expect(this.wrapperDivs.eq(0)).toContain(this.input1);
                expect(this.wrapperDivs.eq(1)).toContain(this.input2);
                expect(this.wrapperDivs.eq(0)).toContain(".chorus_search_clear");
                expect(this.wrapperDivs.eq(1)).toContain(".chorus_search_clear");
            });
        });

        describe("callbacks", function() {
            var onFilterSpy, afterFilterSpy;

            beforeEach(function() {
                onFilterSpy = jasmine.createSpy("onFilter").andCallFake(function() {
                    expect(afterFilterSpy.callCount).toBe(0);
                });

                afterFilterSpy = jasmine.createSpy("afterFilter").andCallFake(function() {
                    expect(onFilterSpy.callCount).toBe(2);
                });

                chorus.search({
                    input: this.input1,
                    list: this.list,
                    onFilter: onFilterSpy,
                    afterFilter: afterFilterSpy
                });
            });

            describe("when text is entered, and items are filtered out", function() {
                beforeEach(function() {
                    this.input1.val("nit").trigger("textchange");
                });

                it("calls the 'onFilter' callback on each item that was filtered out", function() {
                    expect(onFilterSpy.callCount).toBe(2);
                    expect(onFilterSpy.calls[0].args[0]).toBe(this.list.find("li").eq(0));
                    expect(onFilterSpy.calls[1].args[0]).toBe(this.list.find("li").eq(1));
                });

                it("calls the 'afterFilter' callback once, after filtering the items", function() {
                    expect(afterFilterSpy.callCount).toBe(1);
                });
            });
        });
    })

    describe("#addClearButton", function() {
        beforeEach(function() {
            this.input1 = $("<input></input>");
            this.container = $("<div></div>").append(this.input1)

            chorus.addClearButton(this.input1);
            this.clearLink = this.container.find("a.chorus_search_clear");
        });

        it("adds a little 'x' to the right of the search input", function() {
            this.input1.val("nit").trigger("textchange");
            expect(this.clearLink).toExist();
            expect(this.clearLink.find("img").attr("src")).toBe("/images/icon_clear_search.png");
        });

        it("hides the 'x' when the input is blank", function() {
            expect(this.clearLink).toHaveClass("hidden");

            this.input1.val("foo").trigger("textchange");
            expect(this.clearLink).not.toHaveClass("hidden");

            this.input1.val("").trigger("textchange");
            expect(this.clearLink).toHaveClass("hidden");
        });

        describe("when the 'x' is clicked", function() {
            beforeEach(function() {
                this.input1.val("nit").trigger("textchange");
                spyOnEvent(this.input1, 'textchange');
                spyOn($.fn, "blur")
                this.clearLink.click();
            });

            it("clears the search text", function() {
                expect(this.input1.val()).toBe("");
            });

            it("hides the 'x'", function() {
                expect(this.clearLink).toHaveClass("hidden");
            });

            it("triggers a 'textchange' event on the input", function() {
                expect("textchange").toHaveBeenTriggeredOn(this.input1);
            });

            it("blurs the element so the placeholder text reappears", function() {
                expect($.fn.blur).toHaveBeenCalled();
            })
        });
    });

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

    describe("#requireLogin", function() {
        beforeEach(function() {
            this.chorus.initialize();
        })
        describe("from a 'needslogin' from the api", function() {
            beforeEach(function() {
                Backbone.history.fragment = "/foo";
                this.chorus.session.set({user: new chorus.models.User({id: "1", userName: "iAmNumberOne"})});
                this.chorus.session.trigger("needsLogin");
            })

            it("stores the pathBeforeLoggedOut", function() {
                expect(this.chorus.session.pathBeforeLoggedOut).toBe("/foo")
            })

            it("stores the previousUser", function() {
                expect(this.chorus.session.previousUserId).toBe("1")
            })
        })
        describe("from manually logging out", function() {
            beforeEach(function() {
                this.chorus.session.pathBeforeLoggedOut = "/bar";
                this.chorus.session.set({user: new chorus.models.User({id: "1", userName: "iAmNumberOne"})});

                this.chorus.session.previousUserId = "1";

                Backbone.history.fragment = "/logout";
                this.chorus.session.trigger("needsLogin");
            })

            it("does not store the pathBeforeLoggedOut", function() {
                expect(this.chorus.session.pathBeforeLoggedOut).toBeUndefined();
            })

            it("clears out the previousUser", function() {
                expect(this.chorus.session.previousUserId).toBeUndefined();
            })
        })
    })
})
;
