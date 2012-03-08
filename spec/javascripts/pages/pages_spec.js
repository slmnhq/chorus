describe("chorus.pages.Base", function() {
    beforeEach(function() {
        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        });

    });

    describe("initialize", function() {
        beforeEach(function() {
            spyOn(chorus.user, "bind");
            spyOn($.fn, "bind").andCallThrough();
            this.view = new chorus.pages.Base();
            this.view.mainContent = Backbone.View;
        });

        it("binds to change on chorus.user", function() {
            expect(chorus.user.bind).toHaveBeenCalledWith("change", this.view.render, this.view);
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.pages.Base();

            this.view.mainContent = new Backbone.View();
        })

        context("when the page already has a header", function() {
            it("uses the cached header", function() {
                var header = stubView("I is yr header")
                this.view.header = header
                this.view.render();
                expect(this.view.$("#header").text()).toBe("I is yr header")
            });
        });

        context("when the page does not have a header", function() {
            it("creates a Header view", function() {
                this.view.render();
                expect(this.view.$("#header.header")).toExist();
                expect(this.view.header).toBeA(chorus.views.Header);
            });
        });

        context("when the page has a 'workspaceId'", function() {
            beforeEach(function() {
                this.view.workspaceId = '5';
                this.view.render();
            });

            it("passes the workspace id to the header", function() {
                expect(this.view.header.options.workspaceId).toBe("5");
            });
        });

        describe("breadcrumb handling", function() {
            context("with static breadcrumbs", function() {
                beforeEach(function() {
                    this.view.crumbs = [
                        {label : "Home"}
                    ]
                    this.view.render();
                })

                it("creates a BreadcrumbsView with the static breadcrumbs", function() {
                    expect(this.view.breadcrumbs.options.breadcrumbs).toEqual(this.view.crumbs);
                });
            })

            context("with dynamic breadcrumbs", function() {
                beforeEach(function() {
                    this.view.crumbs = function() {
                        return [
                            {label : "There"}
                        ]
                    }
                    this.view.render();
                })

                it("creates a BreadcrumbsView with the dynamic breadcrumbs", function() {
                    expect(this.view.breadcrumbs.options.breadcrumbs).toEqual(this.view.crumbs());
                });
            })
        })

        it("renders the breadcrumbs", function() {
            this.view.crumbs = [
                {label : "Home"}
            ]
            this.view.render();
            expect(this.view.$("#breadcrumbs.breadcrumbs .breadcrumb")).toExist();
        });

        it("populates the #main_content", function() {
            this.view.mainContent = stubView("OH HAI BARABARA");

            this.view.render();

            expect(this.view.$("#main_content").text()).toBe("OH HAI BARABARA");
        });

        it("creates a Sidebar view", function() {
            this.view.sidebar = stubView("VROOOOOOOOOM");
            this.view.render();
            expect(this.view.$("#sidebar .sidebar_content.primary").text()).toBe("VROOOOOOOOOM")
        });

        it("makes an empty sidebar when not provided with a sideBarContent function", function() {
            this.view.render();
            delete this.view.sidebar;
            this.view.render();
            expect(this.view.$("#sidebar.sidebar_content.primary").text().length).toBe(0)
        });
    });

    context("dialogs", function() {
        context("from buttons", function() {
            beforeEach(function() {
                this.view = new chorus.pages.Base();
                this.view.mainContent = new Backbone.View();
                chorus.bindModalLaunchingClicks(this.view);

                var spy = this.fooDialogSpy = new chorus.dialogs.Base();
                spyOn(spy, "launchModal");


                chorus.dialogs.Foo = function(opts) {
                    spy.launchElement = opts.launchElement;
                    spy.pageModel = opts.pageModel;
                    return spy
                };

                this.view.sidebar = stubView("<button type='button' class='dialog' data-dialog='Foo'>Create a Foo</button>");
                this.view.render();
            })

            it("instantiates dialogs from dialog buttons", function() {
                this.view.$("button.dialog").click();
                expect(this.fooDialogSpy.launchModal).toHaveBeenCalled();
            })

            it("passes the launch element to the dialog", function() {
                var elem = this.view.$("button.dialog");
                elem.click();

                expect(this.fooDialogSpy.launchElement).toBe(elem);
            });

            it("passes the pageModel to the dialog", function() {
                this.view.model = new chorus.models.User();
                var elem = this.view.$("button.dialog");
                elem.click();

                expect(this.fooDialogSpy.pageModel).toBe(this.view.model);
            });
        })

        context("from links", function() {
            beforeEach(function() {
                this.view = new chorus.pages.Base();
                this.view.mainContent = new Backbone.View();
                chorus.bindModalLaunchingClicks(this.view);

                var spy = this.fooDialogSpy = new chorus.dialogs.Base();
                spyOn(spy, "launchModal");

                chorus.dialogs.Foo = function(opts) {
                    spy.launchElement = opts.launchElement;
                    spy.pageModel = opts.pageModel;
                    return spy
                };

                this.view.sidebar = stubView("<a class='dialog' data-dialog='Foo'>Create a Foo</button>");
                this.view.render();
            })

            it("instantiates dialogs from dialog buttons", function() {
                this.view.$("a.dialog").click();
                expect(this.fooDialogSpy.launchModal).toHaveBeenCalled();
            })

            it("passes the launch element to the dialog", function() {
                var elem = this.view.$("a.dialog");
                elem.click();
                expect(this.fooDialogSpy.launchElement).toBe(elem);
            })

            it("passes the pageModel to the dialog", function() {
                this.view.model = new chorus.models.User();
                var elem = this.view.$("a.dialog");
                elem.click();

                expect(this.fooDialogSpy.pageModel).toBe(this.view.model);
            });
        })
    })

    context("alerts", function() {
        beforeEach(function() {
            this.view = new chorus.pages.Base();
            this.view.mainContent = new Backbone.View();
            chorus.bindModalLaunchingClicks(this.view);

            var spy = this.fooAlertSpy = new chorus.alerts.Base();
            spyOn(spy, "launchModal");

            chorus.alerts.Foo = function(opts) {
                spy.launchElement = opts.launchElement;
                spy.pageModel = opts.pageModel;
                return spy
            };

            this.view.sidebar = stubView("<a class='alert' data-alert='Foo'>Create a Foo</button>");
            this.view.render();
        })

        it("instantiates alerts from alert links", function() {
            this.view.$("a.alert").click();
            expect(this.fooAlertSpy.launchModal).toHaveBeenCalled();
        })

        it("passses the launch element to the alert", function() {
            var elem = this.view.$("a.alert");
            elem.click();
            expect(this.fooAlertSpy.launchElement).toBe(elem);
        })

        it("passes the pageModel to the dialog", function() {
            this.view.model = new chorus.models.User();
            var elem = this.view.$("a.alert");
            elem.click();

            expect(this.fooAlertSpy.pageModel).toBe(this.view.model);
        });
    })

    describe("help", function() {
        beforeEach(function() {
            spyOn(chorus, "help");
            this.page = new chorus.pages.Base();
            chorus.bindModalLaunchingClicks(this.page);
            this.page.render();
            this.page.$("#help a").click();
        });

        it("shows the help system", function() {
            expect(chorus.help).toHaveBeenCalled();
        })
    })
})
