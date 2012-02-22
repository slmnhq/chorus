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
    });

    describe("initialization", function() {
        beforeEach(function() {
            this.view = new chorus.views.Header();
        })

        it("has required resources", function() {
            expect(this.view.requiredResources.length).toBe(2);
        })

        it("does not have a model", function() {
            expect(this.view.model).toBeUndefined();
        })

        it("fetches the notifications", function() {
            expect(this.server.lastFetchAllFor(this.view.notifications)).toBeDefined();
        });
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.Header();
            this.view.session.loaded = true;
            this.view.session.trigger("loaded");
            this.server.completeFetchAllFor(this.view.notifications,
                [fixtures.notification(), fixtures.notification()])
        })

        it("should have a search field", function() {
            expect(this.view.$(".search input[type=text]")).toExist();
        });

        it("should have a link to the dashboard", function() {
            expect(this.view.$(".logo a").attr("href")).toBe("#/");
        });

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

        context("when there are notifications", function() {
            it("makes the notification count a link", function() {
                expect(this.view.$(".notifications a")).toExist();
            })
        })

        context("when there are no notifications", function() {
            beforeEach(function() {
                this.view.notifications.reset();
                this.view.render();
            });

            it("does not make the notification count a link", function() {
                expect(this.view.$(".notifications a")).not.toExist();
            })

            it("marks the notifications div with an empty class", function() {
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

                it("has a link to 'Users'", function() {
                    expect(this.view.$(".menu.popup_username a[href='#/users']").text()).toBe(t("header.users_list"));
                });

                it("has a link to instances", function() {
                    expect(this.view.$(".menu.popup_username a[href='#/instances']").text()).toMatchTranslation("header.instances");
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
                expect(this.view.$(".notifications a")).toExist();
            });

            describe("when the notification count is clicked", function() {
                beforeEach(function() {
                    this.popupSpy = jasmine.createSpy();
                    $(document).bind("chorus:menu:popup", this.popupSpy);
                    this.view.$(".notifications a").click();
                })

                it("shows a popup menu", function() {
                    expect(this.view.$(".menu.popup_notifications")).not.toHaveClass("hidden");
                    expect(this.view.$(".menu.popup_notifications .pointer")).toExist();
                });

                it("triggers chorus:menu:popup on the document", function() {
                    expect(this.popupSpy).toHaveBeenCalled();
                });

                describe("and when clicked again", function() {
                    beforeEach(function() {
                        this.view.$(".notifications a").click();
                    });

                    it("becomes hidden again", function() {
                        expect(this.view.$(".menu.popup_notifications")).toHaveClass("hidden");
                    });
                });

                describe("the notification list", function() {
                    it("is an activity list", function() {
                        expect(this.view.notificationList).toBeA(chorus.views.ActivityList);
                        expect(this.view.$(".popup_notifications")).toContain(this.view.notificationList.el);
                    });

                    it("doesn't have the activity list heading", function() {
                        expect(this.view.notificationList.options.suppressHeading).toBeTruthy();
                    });

                    it("renders an li for each unread notification", function() {
                        expect(this.view.$(".popup_notifications li").length).toBe(2);
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
                        expect(this.view.$(".notifications a").text()).toBe("1");
                    });

                    it("should render the new notification list", function() {
                        expect(this.view.$(".popup_notifications li").length).toBe(1);
                    });
                });
            });
        });
    });
});
