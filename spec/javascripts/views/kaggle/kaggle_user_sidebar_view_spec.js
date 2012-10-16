describe("chorus.views.KaggleUserSidebar", function () {
    beforeEach(function () {
        this.modalSpy = stubModals();
        this.collection = new chorus.collections.KaggleUserSet([rspecFixtures.kaggleUserSet().at(0)]);

        this.model = this.collection.at(0);
        this.workspace = rspecFixtures.workspace();
        this.view = new chorus.views.KaggleUserSidebar({workspace:this.workspace});
        this.view.setKaggleUser(this.model);
        this.view.render();
    });

    context("with a user", function () {
        beforeEach(function () {
            chorus.PageEvents.broadcast('kaggleUser:selected', this.model);
        });

        it("shows the user's name", function () {
            expect(this.view.$(".info .name")).toContainText(this.model.get("fullName"));
        });

        it("shows the user's location", function () {
            expect(this.view.$(".location")).toContainText(this.model.get("location"));
        });

        it("renders information inside the tabbed area", function () {
            expect(this.view.tabs.information).toBeA(chorus.views.KaggleUserInformation);
            expect(this.view.tabs.information.el).toBe(this.view.$(".tabbed_area .kaggle_user_information")[0]);
        });

        describe("sending a message", function () {
            beforeEach(function () {
            });

            it("links to the send message dialogue", function () {
                expect(this.view.$('a[data-dialog=ComposeKaggleMessage]')).toContainTranslation("actions.compose_kaggle_message");
            });

            it("opens the send message dialog", function () {
                var dialogLink = this.view.$(".actions a.sendMessage");
                expect(dialogLink.data("recipients").at(0).id).toBe(this.collection.at(0).id);
                expect(dialogLink.data("workspace")).toBe(this.workspace);
                expect(dialogLink.data("dialog")).toBe("ComposeKaggleMessage");
            });
        })
    });

    describe("when a single Kaggle user is checked", function () {
        beforeEach(function () {
            this.checkedKaggleUsers = new chorus.collections.KaggleUserSet([rspecFixtures.kaggleUserSet().at(0)]);
            this.multiSelectSection = this.view.$(".multiple_selection");
            chorus.PageEvents.broadcast("kaggleUser:checked", this.checkedKaggleUsers);
        });

        it("does not display the multiple selection section", function () {
            expect(this.multiSelectSection).toHaveClass("hidden");
        });

        context("when two kaggle Users are checked", function () {
            beforeEach(function () {
                this.checkedKaggleUsers.add(rspecFixtures.kaggleUserSet().at(1));
                chorus.PageEvents.broadcast("kaggleUser:checked", this.checkedKaggleUsers);
            });

            it("does display the multiple selection section", function () {
                expect(this.multiSelectSection).not.toHaveClass("hidden");
            });

            it("displays the number of selected kaggle Users", function () {
                expect(this.multiSelectSection.find(".count").text()).toMatchTranslation("kaggle.sidebar.multiple_selection.count", {count:2});
            });

            it("displays the 'send message' link", function () {
                expect(this.multiSelectSection.find("a.sendMessage")).toContainTranslation("actions.send_kaggle_message");
            });

            describe("clicking the 'send message' link", function () {
                beforeEach(function () {
                    this.modalSpy.reset();
                    this.multiSelectSection.find("a.sendMessage").click();
                });

                it("launches the dialog for sending the message", function () {
                    this.multiSelectSection.find("a.sendMessage").click();
                    var dialog = this.modalSpy.lastModal();
                    expect(dialog).toBeA(chorus.dialogs.ComposeKaggleMessage);
                    expect(dialog.recipients).toBe(this.checkedKaggleUsers);
                });
            });
            context("when a kaggle user is selected", function () {
                beforeEach(function () {
                    chorus.PageEvents.broadcast("kaggleUser:selected", rspecFixtures.kaggleUserSet().at(1));
                });

                it("should still show the multiple selection section", function () {
                    expect(this.view.$(".multiple_selection")).not.toHaveClass("hidden");
                });

                it("should retain the selection count when the view is re-rendered", function () {
                    expect(this.view.$(".multiple_selection .count").text()).toMatchTranslation("kaggle.sidebar.multiple_selection.count", {count:2});
                });
            });
        });
    });

});