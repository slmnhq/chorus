describe("chorus.views.Header", function() {
    beforeEach(function() {
        chorus.session = new chorus.models.Session({
            "firstName" : "Daniel",
            "lastName" : "Burke",
            "fullName": "Daniel Francis Burke",
            userName: "dburke",
            id: "55"
        });
        chorus.user = chorus.session;
        this.view = new chorus.views.Header();
        this.view.render();
    });

    it("should have a search field", function() {
        this.view.render();
        expect(this.view.$(".search input[type=text]")).toExist();
    });

    it("should have a link to the dashboard", function() {
        expect(this.view.$(".logo a").attr("href")).toBe("#/");
    });

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
                        "lastName" : "Burkes",
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
                "lastName" : "Burkes",
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

            describe("and when clicked again", function(){
                beforeEach(function() {
                    this.view.$(".username a").click();
                });
                it("becomes hidden again", function(){
                    expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
                });
            });
        });

        describe("the popup menu", function(){
            it("has a link to 'your profile'", function(){
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
    })

    describe("account", function(){
        describe("when clicked", function() {
            beforeEach(function() {
                this.popupSpy = jasmine.createSpy();
                $(document).bind("chorus:menu:popup", this.popupSpy);
                this.view.$(".account a").click();
            })

            it("shows a popup menu", function() {
                expect(this.view.$(".menu.popup_account")).not.toHaveClass("hidden");
            })

            it("triggers chorus:menu:popup on the document", function() {
                expect(this.popupSpy).toHaveBeenCalled();
            })

            describe("and when clicked again", function(){
                beforeEach(function() {
                    this.view.$(".account a").click();
                });
                it("becomes hidden again", function(){
                    expect(this.view.$(".menu.popup_account")).toHaveClass("hidden");
                });
            });
        })

        describe("the popup menu", function(){
            it("has a link to 'your profile'", function(){
                expect(this.view.$(".menu.popup_account a[href='#/users/55']").text()).toBe(t("header.your_profile"));
            });

            it("has a link to 'Users'", function(){
                expect(this.view.$(".menu.popup_account a[href='#/users']").text()).toBe(t("header.users_list"));
            });

            it("has a link to instances", function() {
                expect(this.view.$(".menu.popup_account a[href='#/instances']").text()).toMatchTranslation("header.instances");
            });
        });

        describe("chorus:menu:popup handling", function() {
            beforeEach(function() {
                this.view.$(".account a").click();
                expect(this.view.$(".menu.popup_account")).not.toHaveClass("hidden");
                $(document).trigger("chorus:menu:popup", $(""));
            })

            it("dismisses the popup", function() {
                expect(this.view.$(".menu.popup_account")).toHaveClass("hidden");
            })
        })
    });

    describe("multiple popups", function(){
        describe("at most one is ever visible", function(){
            beforeEach(function(){
                this.view.$(".username a").click();
            });

            it("hides the old popup when you create a new popup", function(){
                expect(this.view.$(".menu.popup_username")).not.toHaveClass("hidden");

                this.view.$(".account a").click();
                expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
                expect(this.view.$(".menu.popup_account")).not.toHaveClass("hidden");
            });
        });
    });
});
