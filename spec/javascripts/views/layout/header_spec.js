describe("chorus.views.Header", function() {
    beforeEach(function() {
        chorus.session = new chorus.models.Session({
            "firstName": "Daniel",
            "lastName": "Burke",
            "fullName": "Daniel Francis Burke",
            userName: "dburke",
            id: "55"
        });
        chorus.user = chorus.session;
    })

    describe("initialization", function() {
        beforeEach(function() {
            chorus._navigated();
            this.view = new chorus.views.Header();
        })

        it("has required resources", function() {
            expect(this.view.requiredResources.length).toBe(2);
        })

        it("does not have a model", function() {
            expect(this.view.model).toBeUndefined();
        })

        it("fetches unread notifications", function() {
            expect(this.view.notifications.attributes.type).toBe("unread");
            expect(this.server.lastFetchAllFor(this.view.notifications)).toBeDefined();
        });

        it("binds to the document for menu popup", function() {
            expect($(document).data("events")["chorus:menu:popup"]).toBeDefined();
        })

        describe("navigating away", function() {
            beforeEach(function() {
                this.oldChorusMenuPopupCount = $(document).data("events")["chorus:menu:popup"].length;
                chorus._navigated();
            });

            it("should unbind from document", function() {
                expect(($(document).data("events")["chorus:menu:popup"] || []).length).toBe(this.oldChorusMenuPopupCount - 1);
            });
        });
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.Header();
            this.view.session.loaded = true;
            this.view.session.trigger("loaded");
            this.server.completeFetchAllFor(this.view.notifications,
                [
                    fixtures.notification(),
                    fixtures.notification()
                ],
                null,
                {
                    page: 1,
                    total: 1,
                    records: 2
                })
        })

        it("should have a search field", function() {
            expect(this.view.$(".search input[type=text]")).toExist();
        });

        it("should have a link to the dashboard", function() {
            expect(this.view.$(".logo a").attr("href")).toBe("#/");
        });

        it("clears requiredResources", function() {
            expect(this.view.requiredResources.length).toBe(0);
        })

        it("inserts the number of notifications into the markup", function() {
            expect(this.view.$(".notifications").text().trim()).toBe("2")
        })

        it("should have a hidden type ahead search view", function() {
            expect(this.view.$(this.view.typeAheadView.el)).toExist();
            expect($(this.view.typeAheadView.el)).toHaveClass("hidden");
        });

        describe("typing in the search bar", function() {
            beforeEach(function() {
                spyOn(this.view.typeAheadView, "searchFor");
                this.view.$(".search input:text").val("test_query").trigger("textchange");
            });

            it("should display the type ahead search view", function() {
                expect(this.view.$(this.view.typeAheadView.el)).toExist();
                expect($(this.view.typeAheadView.el)).not.toHaveClass("hidden");
            });

            it("sets the query in the typeAhead view", function() {
                expect(this.view.typeAheadView.searchFor).toHaveBeenCalledWith("test_query");
            });

            it("hides the search results if the input is empty", function() {
                this.view.$(".search input:text").val("").trigger("textchange");
                expect($(this.view.typeAheadView.el)).toHaveClass("hidden");
            })
            
            it("hides the search view when a link is clicked (if navigating to same route as displayed in browser url bar)", function() {
                var $a = $("<a/>");
                $(this.view.typeAheadView.el).append($a);

                $a.click();

                expect($(this.view.typeAheadView.el)).toHaveClass("hidden");
                expect(this.view.$(".search input:text").val()).toBe("");
            });

            describe("submitting the search", function() {
                beforeEach(function() {
                    spyOn(chorus.router, 'navigate');
                });

                it("includes the query", function() {
                    this.view.$(".search form").trigger("submit");
                    expect(chorus.router.navigate).toHaveBeenCalled();
                    var url = chorus.router.navigate.mostRecentCall.args[0];
                    expect(url).toMatch(/test_query/);
                });

                context("when the header has a workspace id", function() {
                    beforeEach(function() {
                        this.view.options.workspaceId = '11';
                        this.view.$(".search form").trigger("submit");
                    });

                    it("navigates to the workspace search page", function() {
                        expect(chorus.router.navigate).toHaveBeenCalled();
                        var url = chorus.router.navigate.mostRecentCall.args[0];
                        expect(url).toMatchUrl("#/workspaces/11/search/test_query");
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
                        expect(url).toMatchUrl("#/search/test_query");
                    });
                });
            });
        })

        context("when there are notifications", function() {
            it("makes the notification count a link", function() {
                expect(this.view.$("a.notifications")).toExist();
            })
        })

        context("when there are no notifications", function() {
            beforeEach(function() {
                this.view.notifications.reset();
                this.view.render();
            });

            it("marks the notifications with an empty class", function() {
                expect(this.view.$(".notifications")).toHaveClass("empty");
            })
        })

        describe("username", function() {
            describe("where the user has no fullName", function() {
                beforeEach(function() {
                    chorus.user.unset("fullName");
                })

                describe("and the synthesized full name is less than 21 characters", function() {
                    beforeEach(function() {
                        chorus.user.set({ firstName: "0123456789", lastName: "012345" });
                        this.view.render();
                    });

                    it("displays the synthesized full name", function() {
                        expect(this.view.$(".username a").text().trim()).toBe("0123456789 012345");
                    });
                })

                describe("and the synthesized full name is more than 20 characters", function() {
                    beforeEach(function() {
                        chorus.user.set({ firstName: "012345678901234", lastName: "0123456789" });
                        this.view.render();
                    })

                    it("displays the abbreviated synthesized full name", function() {
                        expect(this.view.$(".username a").text().trim()).toBe("012345678901234 0.");
                    });
                })

            });

            describe("where the user has a fullName", function() {
                describe("less than or equal to 20 characters", function() {
                    it("displays the user's full name", function() {
                        expect(this.view.$(".username a").text().trim()).toBe("Daniel Francis Burke");
                    })
                })

                describe("greater than 20 characters", function() {
                    beforeEach(function() {
                        chorus.user.set({
                            "lastName": "Burkes",
                            "fullName": "Daniel Francis Burkes"
                        });
                        this.view.render();
                    });

                    it("displays the user's abbreviated full name", function() {
                        expect(this.view.$(".username a").text().trim()).toBe("Daniel B.");
                    })
                })
            })

            it("has a hidden popup menu", function() {
                expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
            })

            it("has a title attribute equal to the non-abbreviated full name", function() {
                chorus.user.set({
                    "lastName": "Burkes",
                    "fullName": "Daniel Francis Burkes, III"
                });
                this.view.render();

                expect(this.view.$(".username a").attr('title')).toBe("Daniel Francis Burkes, III");
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

        describe("notifications", function() {
            it("displays the notification link", function() {
                expect(this.view.$("a.notifications")).toExist();
            });

            describe("when the notification count is clicked", function() {
                beforeEach(function() {
                    this.popupSpy = jasmine.createSpy();
                    $(document).bind("chorus:menu:popup", this.popupSpy);
                    spyOn(this.view.notifications, "markAllRead").andCallFake(_.bind(function(options) {
                        this.successFunction = options.success;
                    }, this));
                })

                context("and there are no notifications", function() {
                    beforeEach(function() {
                        this.view.$("a.notifications").addClass("empty");
                        this.view.$("a.notifications").click();
                    });

                    it("does not show a popup menu", function() {
                        expect(this.view.$(".menu.popup_notifications")).toHaveClass("hidden");
                    });
                });

                context("and there are notifications", function() {
                    beforeEach(function() {
                        this.view.$("a.notifications").click();
                    });

                    it("shows a popup menu", function() {
                        expect(this.view.$(".menu.popup_notifications")).not.toHaveClass("hidden");
                    });

                    it("triggers chorus:menu:popup on the document", function() {
                        expect(this.popupSpy).toHaveBeenCalled();
                    });

                    it("marks the notifications as read", function() {
                        expect(this.view.notifications.markAllRead).toHaveBeenCalled();
                        expect(this.successFunction).toBeDefined();
                    })

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

                    describe("and when clicked again", function() {
                        beforeEach(function() {
                            this.view.notifications.markAllRead.reset();
                            this.view.$("a.notifications").click();
                        });

                        it("becomes hidden again", function() {
                            expect(this.view.$(".menu.popup_notifications")).toHaveClass("hidden");
                        });

                        it("does not re-mark the notifications as read", function() {
                            expect(this.view.notifications.markAllRead).not.toHaveBeenCalled();
                        });

                    });

                    describe("the notification list", function() {
                        it("is an activity list", function() {
                            expect(this.view.notificationList).toBeA(chorus.views.ActivityList);
                            expect(this.view.$(".popup_notifications")).toContain(this.view.notificationList.el);
                        });

                        it("renders an li for each unread notification", function() {
                            expect(this.view.$(".popup_notifications li").length).toBe(2);
                        });
                    });

                    describe("clicking delete for a notification", function() {
                        beforeEach(function() {
                            chorus.bindModalLaunchingClicks(this.view);
                            this.modalSpy = stubModals();
                            this.view.$('.popup_notifications .delete_link:eq(0)').click();
                        });

                        it("launches the NotificationDeleteAlert", function() {
                            expect(this.modalSpy).toHaveModal(chorus.alerts.NotificationDeleteAlert);
                        });

                        describe("clicking the confirmation", function() {
                            beforeEach(function() {
                                $(this.modalSpy.mostRecentCall.args[0]).find("button.submit").click();
                            });

                            it("deletes the notification", function() {
                                expect(this.server.lastDestroyFor(this.view.notifications.at(0))).toBeDefined();
                            });
                        });
                    });
                    describe("when a notification:deleted event occurs", function() {
                        beforeEach(function() {
                            this.server.reset();
                            chorus.PageEvents.broadcast("notification:deleted");
                        });

                        it("should re-fetch the notifications", function() {
                            expect(this.server.lastFetchAllFor(this.view.notifications)).toBeDefined();
                        });

                        context("when the fetch completes", function() {
                            beforeEach(function() {
                                this.server.completeFetchAllFor(this.view.notifications, [fixtures.notification()]);
                            });

                            it("should display the new notification count", function() {
                                expect(this.view.$("a.notifications").text()).toBe("1");
                            });

                            it("should render the new notification list", function() {
                                expect(this.view.$(".popup_notifications li").length).toBe(1);
                            });
                        });
                    });
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
                    expect(this.view.$(".menu.popup_gear a[href='#/users']").text()).toBe(t("header.users_list"));
                });

                it("has a link to instances", function() {
                    expect(this.view.$(".menu.popup_gear a[href='#/instances']").text()).toMatchTranslation("header.instances");
                });

                it("has a link to the workspaces list", function() {
                    expect(this.view.$(".menu.popup_gear a[href='#/workspaces']").text()).toBe(t("header.workspaces"));
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
});
