describe("chorus.views.Header", function() {
    beforeEach(function() {
        chorus.session = new chorus.models.Session({
            "firstName": "Daniel",
            "lastName": "Burke",
            username: "dburke",
            id: "55"
        });
        chorus.user = chorus.session;
        chorus._navigated();
        this.view = new chorus.views.Header();
        this.view.session.loaded = true;
    });

    describe("initialization", function() {
        it("has required resources", function() {
            expect(this.view.requiredResources.length).toBe(2);
        });

        it("does not have a model", function() {
            expect(this.view.model).toBeUndefined();
        });

        it("fetches unread notifications", function() {
            expect(this.view.unreadNotifications.attributes.type).toBe("unread");
            expect(this.view.unreadNotifications).toHaveBeenFetched();
        });

        it("fetches the first page of notifications (not just unread ones)", function() {
            expect(this.view.notifications.attributes.type).toBeUndefined();
            expect(this.view.notifications).toHaveBeenFetched();
        });

        it("binds to the document for menu popup", function() {
            expect($(document).data("events")["chorus:menu:popup"]).toBeDefined();
        });

    });

    describe("navigating away", function() {
        beforeEach(function() {
            this.oldChorusMenuPopupCount = $(document).data("events")["chorus:menu:popup"].length;
            chorus._navigated();
        });

        it("should unbind from document", function() {
            expect(($(document).data("events")["chorus:menu:popup"] || []).length).toBe(this.oldChorusMenuPopupCount - 1);
        });
    });

    xdescribe("the notifications", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.view.notifications, [
                fixtures.notification({ id: '1' }),
                fixtures.notification({ id: '2' }),
                fixtures.notification({ id: '3' }),
                fixtures.notification({ id: '4' }),
                fixtures.notification({ id: '5' }),
                fixtures.notification({ id: '6' }),
                fixtures.notification({ id: '7' })
            ]);
        });

        context("when there are at least 5 unread notifications", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.view.unreadNotifications, [
                    fixtures.notification(),
                    fixtures.notification(),
                    fixtures.notification(),
                    fixtures.notification(),
                    fixtures.notification(),
                    fixtures.notification()
                ]);
            });

            it("shows all of the unread notifications in the notification popup", function() {
                expect(this.view.notificationList.collection.length).toBe(6);
                this.view.unreadNotifications.each(function(notification, index) {
                    expect(this.view.notificationList.collection.at(index).get("cid")).toEqual(notification.get("cid"))
                }, this);
            });
        });

        context("when there are less than 5 unread notifications", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.view.unreadNotifications,
                    [
                        fixtures.notification({ id: '1' }),
                        fixtures.notification({ id: '2' })
                    ],
                    null,
                    {
                        page: 1,
                        total: 1,
                        records: 2
                    })
            });

            it("renders exactly 5 notifications, including read ones if necessary", function() {
                var listNotifications = this.view.notificationList.collection;
                expect(listNotifications.length).toBe(5);
                expect(listNotifications.at(0).get("id")).toEqual('1');
                expect(listNotifications.at(1).get("id")).toEqual('2');
                expect(listNotifications.at(2).get("id")).toEqual('3');
                expect(listNotifications.at(3).get("id")).toEqual('4');
                expect(listNotifications.at(4).get("id")).toEqual('5');
            });
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            spyOn(chorus, 'addClearButton');

            this.view.session.loaded = true;
            this.view.session.trigger("loaded");
            this.server.completeFetchAllFor(this.view.unreadNotifications,
                [
                    fixtures.notification(),
                    fixtures.notification()
                ],
                null,
                {
                    page: 1,
                    total: 1,
                    records: 2
                });
            this.server.completeFetchFor(this.view.notifications,
                [
                    fixtures.notification(),
                    fixtures.notification(),
                    fixtures.notification(),
                    fixtures.notification(),
                    fixtures.notification()
                ]);
        });

        it("should have a search field", function() {
            expect(this.view.$(".search input[type=text]")).toExist();
        });

        it("should have a link to the dashboard", function() {
            expect(this.view.$(".logo a").attr("href")).toBe("#/");
        });

        it("clears requiredResources", function() {
            expect(this.view.requiredResources.length).toBe(0);
        });

        it("inserts the number of unread notifications into the markup", function() {
            expect(this.view.$("a.notifications").text().trim()).toBe("2")
        });

        it("should have a hidden type ahead search view", function() {
            expect(this.view.$(this.view.typeAheadView.el)).toExist();
            expect($(this.view.typeAheadView.el)).toHaveClass("hidden");
        });

        it("adds a clear button to the search field", function() {
            expect(chorus.addClearButton).toHaveBeenCalledWith(this.view.$(".search input"));
        });

        describe("typing in the search bar", function() {
            beforeEach(function() {
                spyOn(this.view.typeAheadView, "searchFor");
                this.view.$(".search input:text").val("test_query/with/slashes").trigger("textchange");
            });


            it("should display the type ahead search view", function() {
                expect(this.view.$(this.view.typeAheadView.el)).toExist();
                expect($(this.view.typeAheadView.el)).not.toHaveClass("hidden");
            });

            it("sets the query in the typeAhead view", function() {
                expect(this.view.typeAheadView.searchFor).toHaveBeenCalledWith("test_query/with/slashes");
            });

            it("hides the search results if the input is empty", function() {
                this.view.$(".search input:text").val("").trigger("textchange");
                expect($(this.view.typeAheadView.el)).toHaveClass("hidden");
            });

            it("hides the search view when a link is clicked (if navigating to same route as displayed in browser url bar)", function() {
                var $a = $("<a/>");
                $(this.view.typeAheadView.el).append($a);

                $a.click();

                expect($(this.view.typeAheadView.el)).toHaveClass("hidden");
                expect(this.view.$(".search input:text").val()).toBe("");
            });

            describe("clicking outside of the typeahead area", function() {
                beforeEach(function() {
                    $(document).trigger("click");
                });

                it("hides the search view", function() {
                    expect($(this.view.typeAheadView.el)).toHaveClass("hidden");
                });

                it("doesn't clear the search text", function() {
                    expect(this.view.$(".search input:text").val()).toBe("test_query/with/slashes");
                });
            });

            it("calls #handleKeyEvent on the type-ahead view", function() {
                spyOn(this.view.typeAheadView, 'handleKeyEvent');
                var event = jQuery.Event("keydown", { keyCode: 38 });
                this.view.$(".search input").trigger(event);
                expect(this.view.typeAheadView.handleKeyEvent).toHaveBeenCalledWith(event);
            });

            describe("submitting the search", function() {
                beforeEach(function() {
                    spyOn(chorus.router, 'navigate');
                });

                it("includes the query", function() {
                    this.view.$(".search form").trigger("submit");
                    expect(chorus.router.navigate).toHaveBeenCalled();
                    var url = chorus.router.navigate.mostRecentCall.args[0];
                    expect(url).toMatch(/test_query%2Fwith%2Fslashes/);
                });

                context("when the header has a workspace id", function() {
                    beforeEach(function() {
                        this.view.options.workspaceId = '11';
                        this.view.$(".search form").trigger("submit");
                    });

                    it("navigates to the workspace search page", function() {
                        expect(chorus.router.navigate).toHaveBeenCalled();
                        var url = chorus.router.navigate.mostRecentCall.args[0];
                        expect(url).toMatchUrl("#/workspaces/11/search/test_query%252Fwith%252Fslashes");
                    });
                });

                context("when the header doesn't have a workspace id", function() {
                    beforeEach(function() {
                        delete this.view.options.workspaceId;
                        this.view.$(".search form").trigger("submit");
                    });

                    it("navigates to the global search page", function() {
                        expect(chorus.router.navigate).toHaveBeenCalled();
                        var url = chorus.router.navigate.mostRecentCall.args[0];
                        expect(url).toMatchUrl("#/search/test_query%252Fwith%252Fslashes");
                    });
                });
            });
        })

        describe("username", function() {
            beforeEach(function() {
                spyOn(chorus.session.user(), "displayName").andReturn("Armadillo");
                spyOn(chorus.session.user(), "displayShortName").andReturn("Sam");
                this.view.render();
            });

            it("has the short display name in the username link", function() {
                expect(this.view.$(".username a")).toContainText("Sam");
            });

            it("has the full name in the title of the username link", function() {
                expect(this.view.$(".username a").attr("title")).toBe("Armadillo");
            });

            it("has a hidden popup menu", function() {
                expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
            })

            describe("when clicked", function() {
                beforeEach(function() {
                    this.popupSpy = jasmine.createSpy();
                    $(document).bind("chorus:menu:popup", this.popupSpy);
                    this.view.$(".username a").click();
                })

                it("shows a popup menu", function() {
                    expect(this.view.$(".menu.popup_username")).not.toHaveClass("hidden");
                })

                it("triggers chorus:menu:popup on the document", function() {
                    expect(this.popupSpy).toHaveBeenCalled();
                })

                describe("and when clicked again", function() {
                    beforeEach(function() {
                        this.view.$(".username a").click();
                    });
                    it("becomes hidden again", function() {
                        expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
                    });
                });
            });

            describe("the popup menu", function() {
                it("has a link to 'your profile'", function() {
                    expect(this.view.$(".menu.popup_username a[href='#/users/55']").text()).toBe(t("header.your_profile"));
                });

                it("has a link to 'sign out'", function() {
                    expect(this.view.$(".menu.popup_username a[href='#/logout']").text()).toBe(t("header.sign_out"));
                });
            });

            describe("chorus:menu:popup handling", function() {
                beforeEach(function() {
                    this.view.$(".username a").click();
                    expect(this.view.$(".menu.popup_username")).not.toHaveClass("hidden");
                    $(document).trigger("chorus:menu:popup", $(""));
                })

                it("dismisses the popup", function() {
                    expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
                })
            })
        });

        xdescribe("notifications", function() {
            it("displays the notification link", function() {
                expect(this.view.$("a.notifications")).toExist();
            });

            describe("when the notification count is clicked", function() {
                beforeEach(function() {
                    this.popupSpy = jasmine.createSpy();
                    $(document).bind("chorus:menu:popup", this.popupSpy);
                    spyOn(this.view.unreadNotifications, "markAllRead").andCallFake(_.bind(function(options) {
                        this.successFunction = options.success;
                    }, this));
                    spyOn(this.view.notificationList, "show");
                    this.view.$("a.notifications").click();
                })

                it("shows a popup menu", function() {
                    expect(this.view.$(".menu.popup_notifications")).not.toHaveClass("hidden");
                });

                it("triggers chorus:menu:popup on the document", function() {
                    expect(this.popupSpy).toHaveBeenCalled();
                });

                it("marks the notifications as read", function() {
                    expect(this.view.unreadNotifications.markAllRead).toHaveBeenCalled();
                    expect(this.successFunction).toBeDefined();
                })

                it("calls show on the notification list", function() {
                    expect(this.view.notificationList.show).toHaveBeenCalled();
                });

                describe("when the mark-all-read call succeeds", function() {
                    beforeEach(function() {
                        this.successFunction();
                    });

                    it("updates the unread notification count", function() {
                        expect(this.view.$("a.notifications")).toHaveText("0");
                    });

                    it("makes the notifications look empty", function() {
                        expect(this.view.$("a.notifications")).toHaveClass("empty");
                    });
                });

                describe("and then clicked again", function() {
                    beforeEach(function() {
                        this.view.unreadNotifications.markAllRead.reset();
                        spyOn(this.view.notificationList, "postRender");
                        this.view.$("a.notifications").click();
                    });

                    it("becomes hidden again", function() {
                        expect(this.view.$(".menu.popup_notifications")).toHaveClass("hidden");
                    });

                    it("internally marks the unread notifications as read", function() {
                        expect(this.view.notificationList.collection.find(function(model) { return model.get("unread") })).toBeUndefined();
                    });

                    it("re-renders the notification list subview", function() {
                        expect(this.view.notificationList.postRender).toHaveBeenCalled();
                    });

                    it("does not re-mark the notifications as read", function() {
                        expect(this.view.unreadNotifications.markAllRead).not.toHaveBeenCalled();
                    });
                });

                it("has a notification list", function() {
                    expect(this.view.notificationList).toBeA(chorus.views.NotificationList);
                    expect(this.view.$(".popup_notifications")).toContain(this.view.notificationList.el);
                });

                describe("when a notification:deleted event occurs", function() {
                    beforeEach(function() {
                        this.server.reset();
                        this.view.unreadNotifications.loaded = true;
                        this.view.notifications.loaded = true;
                        chorus.PageEvents.broadcast("notification:deleted");
                    });

                    it("should re-fetch the notifications", function() {
                        expect(this.server.lastFetchAllFor(this.view.unreadNotifications)).toBeDefined();
                        expect(this.view.notifications).toHaveBeenFetched();
                    });

                    context("when the fetch completes", function() {
                        beforeEach(function() {
                            this.server.completeFetchAllFor(this.view.unreadNotifications, [], null, { total: 0, page: 1, records: 0 });
                            this.server.completeFetchAllFor(this.view.notifications, [
                                fixtures.notification({ id: '1' }),
                                fixtures.notification({ id: '2' }),
                                fixtures.notification({ id: '3' }),
                                fixtures.notification({ id: '4' })
                            ]);
                        });

                        it("should display the new unread notification count", function() {
                            expect(this.view.$("a.notifications").text()).toBe("0");
                        });

                        it("should render the new notification list", function() {
                            expect(this.view.$(".popup_notifications li").length).toBe(4);
                        });
                    });
                });

                it("has a show-all link", function() {
                    expect(this.view.$(".popup_notifications a.notifications_all")).toContainTranslation("notification.see_all");
                    expect(this.view.$(".popup_notifications a.notifications_all").attr("href")).toBe("#/notifications");
                });
            });
        });

        describe("the gear menu", function() {
            it("is rendered", function() {
                expect(this.view.$(".gear a img")).toHaveAttr("src", "/images/gear_menu.png")
            });

            it("has a hidden popup menu", function() {
                expect(this.view.$(".menu.popup_gear")).toHaveClass("hidden");
            })

            describe("when clicked", function() {
                beforeEach(function() {
                    this.popupSpy = jasmine.createSpy();
                    $(document).bind("chorus:menu:popup", this.popupSpy);
                    this.view.$(".gear a").click();
                })

                it("shows a popup menu", function() {
                    expect(this.view.$(".menu.popup_gear")).not.toHaveClass("hidden");
                })

                it("triggers chorus:menu:popup on the document", function() {
                    expect(this.popupSpy).toHaveBeenCalled();
                })

                describe("and when clicked again", function() {
                    beforeEach(function() {
                        this.view.$(".gear a").click();
                    });
                    it("becomes hidden again", function() {
                        expect(this.view.$(".menu.popup_gear")).toHaveClass("hidden");
                    });
                });
            });

            describe("the popup menu", function() {
                it("has a link to 'Users'", function() {
                    expect(this.view.$(".menu.popup_gear a[href='#/users']").text()).toMatchTranslation("header.users_list");
                });

                it("has a link to instances", function() {
                    expect(this.view.$(".menu.popup_gear a[href='#/instances']").text()).toMatchTranslation("header.instances");
                });

                it("has a link to the workspaces list", function() {
                    expect(this.view.$(".menu.popup_gear a[href='#/workspaces']").text()).toMatchTranslation("header.workspaces");
                });

                it("has a link to the notifications", function() {
                    expect(this.view.$(".menu.popup_gear a[href='#/notifications']").text()).toMatchTranslation("header.notifications");
                });
            });

            describe("chorus:menu:popup handling", function() {
                beforeEach(function() {
                    this.view.$(".gear a").click();
                    expect(this.view.$(".menu.popup_gear")).not.toHaveClass("hidden");
                    $(document).trigger("chorus:menu:popup", $(""));
                })

                it("dismisses the popup", function() {
                    expect(this.view.$(".menu.popup_gear")).toHaveClass("hidden");
                })
            })
        })
    });

    context("when in dev mode", function() {
        beforeEach(function() {
            this.users = new chorus.collections.UserSet([
                rspecFixtures.user({firstName: "user", lastName: "one", id: "1", admin: false}),
                rspecFixtures.user({firstName: "user", lastName: "two", id: "2", admin: false})
            ]);
            chorus.isDevMode.andReturn(true);

            this.view = new chorus.views.Header();
            this.view.session.loaded = true;
            this.server.completeFetchAllFor(this.view.unreadNotifications);
            this.server.completeFetchFor(this.view.notifications);

            this.view.render();
        });

        it("should fetch the users", function() {
            expect(this.server.lastFetch().url).toBe(this.view.users.url({ page: 1, rows: 1000}));
        })

        context("after fetches completes", function() {
            beforeEach(function() {
                stubDefer();
                this.server.completeFetchAllFor(this.view.users, this.users.models);
            });

            afterEach(function() {
                $("select.switch_user").remove();
            });

            it("should have a single switch user to x select box", function() {
                expect($("select.switch_user")).toExist();
            });

            it("should have an option to switch to each user", function() {
                this.users.each(function(user, i) {
                    var option = $(".switch_user option").eq(i + 1)
                    expect(option).toContainText(user.displayName())
                    expect(option.val()).toBe(user.get("username"))
                }, this);
            });

            context("selecting a user", function() {
                beforeEach(function() {
                    var select = $('.switch_user')
                    this.selectedUserName = $('.switch_user option:eq(1)').val()
                    select.val(this.selectedUserName)
                    select.change();
                });

                it("should log the current user out", function() {
                    expect(this.server.lastDestroyFor(chorus.session)).toBeDefined();
                });

                context("when the logout and login finish", function() {
                    beforeEach(function() {
                        spyOn(chorus.router, "reload");
                        this.server.lastRequest().succeed(); // completes logout
                    });

                    context("when the login finish successfully", function() {
                        beforeEach(function() {
                            this.server.completeSaveFor(chorus.session, this.users.at(0));
                        });

                        it("updates the chorus.session.user model", function() {
                            expect(chorus.session.user().get("username")).toBe(this.selectedUserName);
                        });

                        it("reloads the current page", function() {
                            expect(chorus.router.reload).toHaveBeenCalled();
                        })
                    });

                    context("when the login failed", function() {
                        beforeEach(function() {
                            spyOnEvent(chorus.session, "needsLogin");
                            chorus.session.trigger("saveFailed");
                        });

                        it("triggers needs Login", function() {
                            expect("needsLogin").toHaveBeenTriggeredOn(chorus.session);
                        });
                    });
                });
            });
        })
    });
});
