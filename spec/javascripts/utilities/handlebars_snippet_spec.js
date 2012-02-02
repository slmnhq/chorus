describe("handlebars", function() {
    describe("registered helpers", function() {
        describe("cache_buster", function() {
            it("should be different when called at different times", function() {
                var first_cb, second_cb;
                runs(function() {
                    first_cb = Handlebars.compile("{{cache_buster}}")();
                });

                waits(1); // milliseconds

                runs(function() {
                    second_cb = Handlebars.compile("{{cache_buster}}")();
                });

                runs(function() {
                    expect(first_cb).not.toEqual(second_cb);
                });
            });
        });

        describe("ifAdmin", function() {
            beforeEach(function() {
                this.ifAdminSpy = jasmine.createSpy();
                this.ifAdminSpy.inverse = jasmine.createSpy();
            });

            describe("when the user is an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ admin: true });
                });

                it("executes the block", function() {
                    Handlebars.helpers.ifAdmin(this.ifAdminSpy);
                    expect(this.ifAdminSpy).toHaveBeenCalled();
                    expect(this.ifAdminSpy.inverse).not.toHaveBeenCalled();
                })
            });

            describe("when the user is not an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ admin: false });
                });

                it("does not execute the block", function() {
                    Handlebars.helpers.ifAdmin(this.ifAdminSpy);
                    expect(this.ifAdminSpy.inverse).toHaveBeenCalled();
                    expect(this.ifAdminSpy).not.toHaveBeenCalled();
                });
            });

            describe("when chorus.user is undefined", function() {
                beforeEach(function() {
                    unsetLoggedInUser();
                });

                it("does not execute the block", function() {
                    Handlebars.helpers.ifAdmin(this.ifAdminSpy);
                    expect(this.ifAdminSpy.inverse).toHaveBeenCalled();
                    expect(this.ifAdminSpy).not.toHaveBeenCalled();
                });
            })
        });

        describe("ifCurrentUserNameIs", function() {
            beforeEach(function() {
                setLoggedInUser({ userName: "benjamin" });
                this.spy = jasmine.createSpy("ifCurrentUserNameIs");
                this.spy.inverse = jasmine.createSpy("ifCurrentUserNameIs inverse");
            });

            describe("when the given userName matches the current user's name'", function() {
                it("executes the block", function() {
                    Handlebars.helpers.ifCurrentUserNameIs("benjamin", this.spy);
                    expect(this.spy).toHaveBeenCalled();
                    expect(this.spy.inverse).not.toHaveBeenCalled();
                })
            });

            describe("when the given userName does NOT match the current user's name", function() {
                it("execute the inverse block", function() {
                    Handlebars.helpers.ifCurrentUserNameIs("noe valley", this.spy)
                    expect(this.spy.inverse).toHaveBeenCalled();
                    expect(this.spy).not.toHaveBeenCalled();
                });
            });

            describe("when chorus.user is undefined", function() {
                beforeEach(function() {
                    unsetLoggedInUser();
                });

                it("executes the inverse block", function() {
                    Handlebars.helpers.ifCurrentUserNameIs("superman", this.spy);
                    expect(this.spy.inverse).toHaveBeenCalled();
                    expect(this.spy).not.toHaveBeenCalled();
                });
            })
        });

        describe("ifAll", function() {
            beforeEach(function() {
                this.ifAllSpy = jasmine.createSpy('ifAll');
                this.ifAllSpy.inverse = jasmine.createSpy('ifAll.inverse');
            });

            it("throws an exception if no arguments were passed", function() {
                var exceptionThrown;
                try {
                    Handlebars.helpers.ifAll(this.ifAllSpy, this.ifAllSpy.inverse);
                } catch (e) {
                    exceptionThrown = e;
                }
                expect(exceptionThrown).toMatch(/argument/);
            });

            context("when an else block is present", function() {
                beforeEach(function() {
                    this.template = "{{#ifAll first second}}yes{{else}}no{{/ifAll}}";
                });

                it("renders the else block if any arguments are falsy", function() {
                    var context = {first: true, second: false};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("no");
                });

                it("renders the block if all arguments are truthy", function() {
                    var context = {first: true, second: 'this string is not normally truthy in IE8'};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("yes");
                });
            });

            context("when an else block is not present", function() {
                beforeEach(function() {
                    this.template = "{{#ifAll first second}}yes{{/ifAll}}";
                });

                it("renders nothing if any arguments are falsy", function() {
                    var context = {first: true, second: false};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("");
                });

                it("renders the block if all arguments are truthy", function() {
                    var context = {first: true, second: true};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("yes");
                });
            });
        });

        describe("ifAny", function() {
            beforeEach(function() {
                this.ifAnySpy = jasmine.createSpy('ifAny');
                this.ifAnySpy.inverse = jasmine.createSpy('ifAny.inverse');
            });

            it("throws an exception if no arguments were passed", function() {
                var exceptionThrown;
                try {
                    Handlebars.helpers.ifAny(this.ifAnySpy, this.ifAnySpy.inverse);
                } catch (e) {
                    exceptionThrown = e;
                }
                expect(exceptionThrown).toMatch(/argument/);
            });

            context("when an else block is present", function() {
                beforeEach(function() {
                    this.template = "{{#ifAny first second}}yes{{else}}no{{/ifAny}}";
                });

                it("renders the else block if all arguments are falsy", function() {
                    var context = {first: false, second: false};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("no");
                });

                it("renders the block if any arguments are truthy", function() {
                    var context = {first: false, second: 'hello'};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("yes");
                });
            });

            context("when an else block is not present", function() {
                beforeEach(function() {
                    this.template = "{{#ifAny first second}}yes{{/ifAny}}";
                });

                it("renders nothing if all arguments are falsy", function() {
                    var context = {first: false, second: false};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("");
                });

                it("renders the block if any arguments are truthy", function() {
                    var context = {first: 'ie8 is cool', second: false};
                    var string = Handlebars.compile(this.template)(context);
                    expect(string).toBe("yes");
                });
            });
        });

        describe("displayNameFromPerson", function() {
            it("renders the fullname", function() {
                expect(Handlebars.helpers.displayNameFromPerson({firstName: "EDC", lastName: "Admin"})).toBe("EDC Admin");
            })
        })

        describe("displayTimestamp", function() {
            it("renders the timestamp with milliseconds", function() {
                expect(Handlebars.helpers.displayTimestamp("2011-11-23 15:42:02.321")).toBe("November 23");
            })

            it("renders the timestamp without milliseconds", function() {
                expect(Handlebars.helpers.displayTimestamp("2011-1-23 15:42:02")).toBe("January 23");
            });

            it("tolerates bogus timestamps", function() {
                expect(Handlebars.helpers.displayTimestamp("yo momma")).toBe("WHENEVER");
            })

            it("tolerates undefined", function() {
                expect(Handlebars.helpers.displayTimestamp()).toBe("WHENEVER");
            })
        })

        describe("relativeTimestamp", function() {
            it("renders the relative timestamp", function() {
                var tm = (50).hours().ago().toString("yyyy-MM-dd hh:mm:ss");
                expect(Handlebars.helpers.relativeTimestamp(tm)).toBe("2 days ago");
            })

            it("tolerates bogus timestamps", function() {
                expect(Handlebars.helpers.relativeTimestamp("yo momma")).toBe("WHENEVER");
            })

            it("tolerates undefined", function() {
                expect(Handlebars.helpers.relativeTimestamp()).toBe("WHENEVER");
            })
        })

        describe("moreLink", function() {
            describe("when the collection has more than max elements", function() {
                it("returns markup", function() {
                    var el = $("<div>" + Handlebars.helpers.moreLink([1, 2, 3, 4], 3, "activity_stream.comments.more", "activity_stream.comments.less") + "</div>");
                    expect(el.find(".morelinks a.more")).toExist();
                    expect(el.find(".morelinks a.less")).toExist();
                    expect(el.find(".morelinks a.more")).toHaveText(t("activity_stream.comments.more", {count: 1}));
                    expect(el.find(".morelinks a.less")).toHaveText(t("activity_stream.comments.less"));
                })
            });
            describe("when the collection has less than max + 1 elements", function() {
                it("returns no markup", function() {
                    var el = $("<div>" + Handlebars.helpers.moreLink([1, 2, 3, 4], 3, "thing", "less") + "</div>");
                    expect(el.find(".links")).not.toExist();
                })
            });
        });

        describe("currentUserName", function() {
            beforeEach(function() {
                this.template = "{{currentUserName}}";
                chorus.session.set({userName: "bob"});
            });
            it("should return the user", function() {
                expect(Handlebars.compile(this.template)({})).toBe(chorus.session.get("userName"));
            });
        });

        describe("eachWithMoreLink", function() {
            beforeEach(function() {
                this.yieldSpy = jasmine.createSpy();
                this.yieldSpy.inverse = jasmine.createSpy();
                spyOn(Handlebars.helpers, "moreLink");
            });

            describe("when the collection has more than max elements", function() {
                beforeEach(function() {
                    this.collection = [
                        { name: "foo" },
                        { name: "bar" },
                        { name: "bro" }
                    ];
                    Handlebars.helpers.eachWithMoreLink(this.collection, 2, "activity_stream.comments.more",
                        "activity_stream.comments.less", this.yieldSpy, this.yieldSpy.inverse);
                })

                it("yields to the block for each element", function() {
                    expect(this.yieldSpy.callCount).toBe(3);
                })

                it("calls moreLink", function() {
                    expect(Handlebars.helpers.moreLink).toHaveBeenCalledWith(this.collection, 2,
                        "activity_stream.comments.more", "activity_stream.comments.less");
                })

                it("sets the 'more' context attribute when yielding for each element with an index greater than max", function() {
                    expect(this.yieldSpy.calls[0].args[0].moreClass).toBe("");
                    expect(this.yieldSpy.calls[1].args[0].moreClass).toBe("");
                    expect(this.yieldSpy.calls[2].args[0].moreClass).toBe("more");
                })
            })

            describe("when the collection has less than or equal to max elements", function() {
                beforeEach(function() {
                    this.collection = [
                        { name: "foo" },
                        { name: "bar" }
                    ];
                    Handlebars.helpers.eachWithMoreLink(this.collection, 2, "activity_stream.comments.more",
                        "activity_stream.comments.less", this.yieldSpy, this.yieldSpy.inverse);
                })

                it("yields to the block for each element", function() {
                    expect(this.yieldSpy.callCount).toBe(2);
                })

                it("calls moreLink", function() {
                    expect(Handlebars.helpers.moreLink).toHaveBeenCalledWith(this.collection, 2,
                        "activity_stream.comments.more", "activity_stream.comments.less");
                })

                it("does not set the 'more' context attribute when yielding for any element", function() {
                    expect(this.yieldSpy.calls[0].args[0].moreClass).toBe("");
                    expect(this.yieldSpy.calls[1].args[0].moreClass).toBe("");
                })
            })
        })

        describe("pluralize", function() {
            it("uses the singular string if there is only one element", function() {
                expect(Handlebars.helpers.pluralize([1], "breadcrumbs.home")).toBe(t("breadcrumbs.home"))
            })

            context("when there is more than one element", function() {
                context("and no plural string is present", function() {
                    it("adds an 's' to the singular string", function() {
                        expect(Handlebars.helpers.pluralize([1, 2], "breadcrumbs.home")).toBe(t("breadcrumbs.home") + "s")
                    })
                })

                context("and a plural string is present", function() {
                    it("uses the plural string", function() {
                        expect(Handlebars.helpers.pluralize([1, 2], "test.deer")).toBe(t("test.deer_plural"))
                    })
                })
            })
        })

        describe("fileIconUrl", function() {
            it("returns the icon url for the file", function() {
                expect(Handlebars.helpers.fileIconUrl("SQL", "medium")).toBe(chorus.urlHelpers.fileIconUrl("SQL", "medium"))
            })
        })

        describe("renderTemplate", function() {
            it("renders the template", function() {
                expect(Handlebars.helpers.renderTemplate('plain_text', {text: 'foo'}).trim()).toBe('foo');
            });
        });

        describe("linkTo", function() {
            it("returns an html string with the right text and href", function() {
                var link = $(Handlebars.helpers.linkTo("/users/1", "Charlie"));

                // Coding like weirdos here to make IE8 happy
                expect(link.is("a")).toBeTruthy();
                expect(link.text().trim()).toBe("Charlie");
                expect(link.attr("href")).toBe("/users/1");
            });

            it("applies the given attributes", function() {
                var link = Handlebars.helpers.linkTo("/users/1", "Charlie", { 'class': "dude" });
                expect($(link).hasClass("dude")).toBeTruthy();
            });

            it("html escapes the text", function() {
                var link = Handlebars.helpers.linkTo("/", "<script>");
                expect(link).toMatch('&lt;script&gt;');
            });
        });

        describe("hotKeyName", function() {
            it("uses chorus.hotKeyMeta to construct a human-readable hot key description", function() {
                expect(Handlebars.helpers.hotKeyName('k')).toBe(_.str.capitalize(chorus.hotKeyMeta) + " + k")
            })
        })

        describe("workspaceUsage", function() {
            it("should never have a width greater than 100%", function() {
                expect($(Handlebars.helpers.workspaceUsage(101)).find('.used').attr('style')).toContain("100%");
            })

            it("should be red if percentage is >= 100%", function() {
                expect($(Handlebars.helpers.workspaceUsage(99, '1GB')).find('.used')).not.toHaveClass('full');
                expect($(Handlebars.helpers.workspaceUsage(100, '1GB')).find('.used')).toHaveClass('full');
                expect($(Handlebars.helpers.workspaceUsage(101, '1GB')).find('.used')).toHaveClass('full');
            })

            it("with percentage >= 100% it has percentage text", function() {
                expect($(Handlebars.helpers.workspaceUsage(99, '1GB')).find('.percentage_text')).not.toExist();
                expect($(Handlebars.helpers.workspaceUsage(100, '1GB')).find('.percentage_text')).toContainText('100%');
                expect($(Handlebars.helpers.workspaceUsage(101, '1GB')).find('.percentage_text')).toContainText('101%');
            });

            it("with percentage >= 50 it has size text inside the used bar", function() {
                expect($(Handlebars.helpers.workspaceUsage(50, '1GB')).find('.used .size_text')).toContainText('1GB');
                expect($(Handlebars.helpers.workspaceUsage(100, '1GB')).find('.used .size_text')).toContainText('1GB');
                expect($(Handlebars.helpers.workspaceUsage(50, '1GB')).find('> .size_text')).not.toExist();
            });

            it("with percentage < 50 it has size text outside the used bar", function() {
                expect($(Handlebars.helpers.workspaceUsage(49, '1GB')).find('.used .size_text')).not.toExist();
                expect($(Handlebars.helpers.workspaceUsage(49, '1GB')).find('> .size_text')).toContainText('1GB');
            });
        });

        describe("limit_chooser", function() {
            it("returns a list of numbers up to the max specified", function() {
                var chooser = $(Handlebars.helpers.limit_chooser({hash: {max: 3}}))
                expect(chooser.find('.limiter_menu_container ul.limiter_menu li').length).toBe(3);
                expect(chooser.find('li:first')).toContainText('1');
            });

            it("has a limiter class", function() {
                expect($(Handlebars.helpers.limit_chooser({hash: {max: 1}}))).toHaveClass('limiter');
            });

            it("sets the default to the provided value", function() {
                var chooser = $(Handlebars.helpers.limit_chooser({hash: {max: 3, default: 2}}));
                expect(chooser.find('a')).toContainText('2');
            })

            it("sets the default to max if no default provided", function() {
                var chooser = $(Handlebars.helpers.limit_chooser({hash: {max: 3}}));
                expect(chooser.find('a')).toContainText('3');
            })

            it("sets the className if provided", function() {
                var chooser = $(Handlebars.helpers.limit_chooser({hash: {max: 3, className: 'foo'}}));
                expect(chooser).toHaveClass('foo');
            })
        })
    });

    describe("partials", function() {
        describe("errorDiv", function() {
            context("when context.serverErrors is undefined", function() {
                beforeEach(function() {
                    this.context = {};
                });

                it("renders an empty div", function() {
                    var el = Handlebars.VM.invokePartial(Handlebars.partials.errorDiv, "errorDiv", this.context, Handlebars.helpers, Handlebars.partials);
                    expect(el).toBe('<div class="errors"></div>');
                });
            });

            context("when context.serverErrors is an empty array", function() {
                beforeEach(function() {
                    this.context = { serverErrors: [] };
                });

                it("renders an empty div", function() {
                    var el = Handlebars.VM.invokePartial(Handlebars.partials.errorDiv, "errorDiv", this.context, Handlebars.helpers, Handlebars.partials);
                    expect(el).toBe('<div class="errors"></div>');
                });
            });

            context("when context.serverErrors is an array of hashes with 'message' keys", function() {
                beforeEach(function() {
                    this.context = { serverErrors: [
                        { message: "one" },
                        { message: "two" }
                    ] };
                });

                it("renders the messages", function() {
                    var el = Handlebars.VM.invokePartial(Handlebars.partials.errorDiv, "errorDiv", this.context, Handlebars.helpers, Handlebars.partials);
                    expect($(el).find("li").length).toBe(2);
                    expect(el).toContain("one");
                    expect(el).toContain("two");
                });
            });
        });
    });
});
