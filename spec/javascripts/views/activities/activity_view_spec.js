describe("chorus.views.Activity", function() {
    beforeEach(function() {
        this.model = fixtures.activity.NOTE();
        this.view = new chorus.views.Activity({ model: this.model });
    });

    describe("#render", function() {
        context("type: MEMBERS_ADDED", function() {
            beforeEach(function() {
                this.model.set({type: "MEMBERS_ADDED"});
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderWorkspaceDetails({checkLink : true});
        });

        describe("entityType mapping", function() {
            context("type: NOTE", function() {
                beforeEach(function() {
                    this.view.model.set({ type : "NOTE" })
                })

                it("sets entityType to 'comment'", function() {
                    this.view.render();
                    expect(this.view.$("a.comment").data("entity-type")).toBe('comment')
                })
            })
        })

        describe("entityTitle mapping", function() {
            context("type: NOTE", function() {
                beforeEach(function() {
                    this.view.model.set({ type : "NOTE" })
                })

                it("sets entityTitle to 'note'", function() {
                    this.view.render();
                    expect(this.view.$("a.comment").data("entity-title")).toBe(t("comments.title.NOTE"))
                })
            })
        })

        context("type: WORKSPACE_CREATED", function() {
            beforeEach(function() {
                this.model = fixtures.activity.WORKSPACE_CREATED();
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
        });

        context("type: WORKSPACE_DELETED", function() {
            beforeEach(function() {
                this.model = fixtures.activity.WORKSPACE_DELETED();
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : false});
        });

        context("type: NOTE", function() {
            beforeEach(function() {
                this.model = fixtures.activity.NOTE();
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderWorkspaceDetails({checkLink : true});

            it("displays the comment body", function() {
               expect(this.view.$(".body").eq(0).text().trim()).toBe(this.view.model.get("text"));
            });

            it("displays the timestamp", function() {
                expect(this.view.$(".timestamp").text()).not.toBeEmpty();
            });

            it("renders items for the sub-comments", function() {
                expect(this.model.get("comments").length).toBe(1);
                expect(this.view.$(".comments li").length).toBe(1);
            });
        });

        context("when the type is unknown", function() {
            beforeEach(function() {
                this.model.set({type: "DINNER_TIME"});
                this.view.render();
            });

            it("returns a default header", function() {
                this.model.set({ type: "GEN MAI CHA" });
                expect(this.view.headerHtml()).toBeDefined();
            });
        });
    });

    function itShouldRenderAuthorDetails() {
        it("renders the author's icon", function() {
            expect(this.view.$('img').attr('src')).toBe(this.view.model.author().imageUrl());
        });

        it("contains the author's name", function() {
            expect(this.view.$("a.author").text()).toContain(this.view.model.author().displayName());
        });

        it("contains the author's url", function() {
            expect(this.view.$('a.author').attr('href')).toBe(this.view.model.author().showUrl());
        });
    };

    function itShouldRenderObjectDetails(options) {
        options || (options = {});

        it("contains the object's name", function() {
            expect(this.view.$(".object").text()).toContain(this.view.model.objectName());
        });

        if (options.checkLink) {
            it("contains the object's url", function() {
                expect(this.view.$('.object a').attr('href')).toBe(this.view.model.objectUrl());
            });
        }
    };

    function itShouldRenderWorkspaceDetails(options) {
        options || (options = {});

        it("contains the workspace's name", function() {
            expect(this.view.$(".workspace").text()).toContain(this.view.model.workspaceName());
        });

        if (options.checkLink) {
            it("contains the workspace's url", function() {
                expect(this.view.$('.workspace a').attr('href')).toBe(this.view.model.workspaceUrl());
            });
        }
    };
});
