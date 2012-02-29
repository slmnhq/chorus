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

        describe("#ifAdminOr", function() {
            beforeEach(function() {
                this.ifAdminOrSpy = jasmine.createSpy();
                this.ifAdminOrSpy.inverse = jasmine.createSpy();
            });

            context("when the user is an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ admin: true });
                });

                it("executes the block", function() {
                    Handlebars.helpers.ifAdminOr(false, this.ifAdminOrSpy);
                    expect(this.ifAdminOrSpy).toHaveBeenCalled();
                    expect(this.ifAdminOrSpy.inverse).not.toHaveBeenCalled();
                })
            })

            context("when user is not an admin", function() {
                beforeEach(function() {
                    setLoggedInUser({ admin: false });
                });

                it("executes the block when the flag is true", function() {
                    Handlebars.helpers.ifAdminOr(true, this.ifAdminOrSpy);
                    expect(this.ifAdminOrSpy).toHaveBeenCalled();
                    expect(this.ifAdminOrSpy.inverse).not.toHaveBeenCalled();
                })

                it("executes the inverse block when the flag is false", function() {
                    Handlebars.helpers.ifAdminOr(false, this.ifAdminOrSpy);
                    expect(this.ifAdminOrSpy).not.toHaveBeenCalled();
                    expect(this.ifAdminOrSpy.inverse).toHaveBeenCalled();
                })
            })
        })

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
            it("passes arguments through to the translate function", function() {
                expect(Handlebars.helpers.pluralize(1, "test.mouse_with_param", { hash: { param: "James" }}))
                    .toMatchTranslation("test.mouse_with_param", { param: "James" });
                expect(Handlebars.helpers.pluralize(2, "test.mouse_with_param", { hash: { param: "Henry" }}))
                    .toMatchTranslation("test.mouse_with_param_plural", { param: "Henry" });
            });

            context("when the first argument is an array", function() {
                it("uses the singular string if there is only one element", function() {
                    expect(Handlebars.helpers.pluralize([1], "breadcrumbs.home"))
                        .toMatchTranslation("breadcrumbs.home");
                })

                context("when there is more than one element", function() {
                    context("and no plural string is present", function() {
                        it("adds an 's' to the singular string", function() {
                            expect(Handlebars.helpers.pluralize([1, 2], "breadcrumbs.home"))
                                .toBe(t("breadcrumbs.home") + "s")
                        })
                    })

                    context("and a plural string is present", function() {
                        it("uses the plural string", function() {
                            expect(Handlebars.helpers.pluralize([1, 2], "test.mouse"))
                                .toMatchTranslation("test.mouse_plural");
                        })
                    })
                })
            });

            context("when the first argument is a number", function() {
                it("uses the singular string if the number is exactly one", function() {
                    expect(Handlebars.helpers.pluralize(1, "breadcrumbs.home"))
                        .toMatchTranslation("breadcrumbs.home");
                })

                context("when there is more than one element", function() {
                    context("and no plural string is present", function() {
                        it("adds an 's' to the singular string", function() {
                            expect(Handlebars.helpers.pluralize(3, "breadcrumbs.home"))
                                .toBe(t("breadcrumbs.home") + "s")
                        })
                    })

                    context("and a plural string is present", function() {
                        it("uses the plural string", function() {
                            expect(Handlebars.helpers.pluralize(3, "test.mouse"))
                                .toMatchTranslation("test.mouse_plural");
                        })
                    })
                })
            });
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

        describe("range_chooser", function() {
            it("returns a list of numbers up to the max specified", function() {
                var html = Handlebars.compile("{{range_chooser max=3}}")();
                var chooser = $(html);
                expect(chooser.find('.limiter_menu_container ul.limiter_menu li').length).toBe(3);
                expect(chooser.find('li:first')).toContainText('1');
            });

            it("has a limiter class", function() {
                var html = Handlebars.compile("{{range_chooser max=1}}")();
                var chooser = $(html);
                expect(chooser).toHaveClass('limiter');
            });

            it("sets the default to the provided value", function() {
                var html = Handlebars.compile("{{range_chooser max=3 initial=2}}")();
                var chooser = $(html);
                expect(chooser.find('a')).toContainText('2');
            })

            it("sets the default to max if no default provided", function() {
                var html = Handlebars.compile("{{range_chooser max=3}}")();
                var chooser = $(html);
                expect(chooser.find('a')).toContainText('3');
            })

            it("sets the className if provided", function() {
                var html = Handlebars.compile('{{range_chooser max=3 className="foo"}}')();
                var chooser = $(html);
                expect(chooser).toHaveClass('foo');
            })
        });

        describe("renderTableData", function() {
            beforeEach(function() {
                this.template = "{{renderTableData x}}";
            });

            it("renders the string false for the boolean false", function() {
                var context = {x: false};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("false");
            });

            it("renders the string 0 for the number 0", function() {
                var context = {x: 0};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("0");
            });

            it("renders &nbsp; for null", function() {
                var context = {x: null};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("&nbsp;");
            });

            it("renders NaN for NaN", function() {
                var context = {x: NaN};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("NaN");
            });
        });

        describe("percentage", function() {
            beforeEach(function() {
                this.template = "{{percentage value}}";
            });

            it("should display the value rounded to two decimal places", function() {
                var context = {value: 10.494727};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("10.49%");
            });
        });

        describe("round", function() {
            beforeEach(function() {
                this.template = "{{round value}}";
            });

            it("should not round the value", function() {
                var context = {value: .0012344}
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("0.0012344");
            });

            it("should round the value to two decimal places", function() {
                var context = {value: 10.494727};
                var string = Handlebars.compile(this.template)(context);
                expect(string).toBe("10.49");
            });
        });

        describe("usedInWorkspaces", function() {
            context("when there is no data", function() {
                beforeEach(function() {
                    this.result = Handlebars.helpers.usedInWorkspaces(undefined);
                });

                it("does not render", function() {
                    expect(this.result).toBeFalsy();
                });
            });

            context("when there aren't any 'found in' workspaces", function() {
                beforeEach(function() {
                    this.workspaceUsed = {
                        workspaceList: [],
                        workspaceCount: 0
                    }
                    this.result = Handlebars.helpers.usedInWorkspaces(this.workspaceUsed);
                });

                it("does not render", function() {
                    expect(this.result).toBeFalsy();
                });
            });

            context("when there is exactly 1 'found in' workspace", function() {
                beforeEach(function() {
                    this.workspaceUsed = {
                        workspaceList: [fixtures.nestedWorkspaceJson()],
                        workspaceCount: 1
                    }
                    this.result = Handlebars.helpers.usedInWorkspaces(this.workspaceUsed);
                });
                itIncludesTheFoundInWorkspaceInformation();

                it("should not indicate there are any other workspaces", function() {
                    expect($(this.result).find('a').length).toBe(1);
                })
            })

            context("when there are exactly 2 'found in' workspaces", function() {
                beforeEach(function() {
                    this.workspaceUsed = {
                        workspaceList: [fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson()],
                        workspaceCount: 2
                    }
                    this.result = Handlebars.helpers.usedInWorkspaces(this.workspaceUsed);
                });

                itIncludesTheFoundInWorkspaceInformation();

                it("should indicate there is 1 other workspace", function() {
                    expect($(this.result)).toContainTranslation("workspaces_used_in.other_workspaces", {count: 1});
                })
            })

            context("when there are exactly 3 'found in' workspaces", function() {
                beforeEach(function() {
                    this.workspaceUsed = {
                        workspaceList: [fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson(), fixtures.nestedWorkspaceJson()],
                        workspaceCount: 3
                    }
                    this.result = Handlebars.helpers.usedInWorkspaces(this.workspaceUsed);
                });

                itIncludesTheFoundInWorkspaceInformation();

                it("should indicate there is 2 other workspaces", function() {
                    expect($(this.result)).toContainTranslation("workspaces_used_in.other_workspaces", {count: 2});
                })

                it("includes a menu to the other workspaces", function() {
                    expect($(this.result).find("a.open_other_menu")).toExist();
                    expect($(this.result).find(".other_menu li").length).toBe(2);
                    var workspace = new chorus.models.Workspace(this.workspaceUsed.workspaceList[1]);
                    expect($(this.result).find(".other_menu li a:eq(0)")).toHaveAttr('href', workspace.showUrl())
                    expect($(this.result).find(".other_menu li a:eq(0)")).toContainText(workspace.get('name'))
                })
            })

            function itIncludesTheFoundInWorkspaceInformation() {
                it("includes the 'found in workspace' information", function() {
                    var workspace = new chorus.models.Workspace(this.workspaceUsed.workspaceList[0]);
                    expect($(this.result).find("a").attr("href")).toMatchUrl(workspace.showUrl());
                    expect($(this.result).find("a")).toContainText(workspace.get('name'));
                });
            }
        });
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
