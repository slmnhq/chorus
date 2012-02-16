describe("chorus.views.DatasetEditChorusView", function() {
    beforeEach(function() {

        this.dataset = fixtures.datasetChorusView();
        this.view = new chorus.views.DatasetEditChorusView({ model: this.dataset });
        $("#jasmine_content").append(this.view.el);
        this.clock = sinon.useFakeTimers();

        // in IE8, we can't 'select' a textrange whose textarea is not on the DOM
        if ($.browser.msie) {
            spyOn(window.TextRange.prototype, 'select');
        }
        spyOn(CodeMirror, "fromTextArea").andCallThrough();
        stubDefer()
    })

    context("#setup", function() {
        it("saves the initial query value", function() {
            expect(this.view.model.initialQuery).toBe(this.view.model.get("query"));
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            spyOn(this.view, "updateQueryInModel").andCallThrough();
            this.view.render();
        });

        it("displays the query", function() {
            expect(this.view.editor.getValue()).toBe(this.dataset.get("query"));
        });

        it("displays line numbers", function() {
            expect(this.view.editor.getOption("lineNumbers")).toBe(true);
        });

        it("displays the query", function() {
            expect(this.view.editor.getValue()).toBe(this.dataset.get("query"));
        });

        it("uses the 'text/x-sql' mode", function() {
            expect(this.view.editor.getOption("mode")).toBe("text/x-sql");
        });

        context("when blur is received by the editor", function() {
            beforeEach(function() {
                spyOn(this.view, "postRender");
                this.view.editor.focus();
                this.view.editor.setValue("select * from hello;")
                $(this.view.$(".CodeMirror")[0].firstChild.firstChild).blur();
            });

            it("sets the query in the model", function() {
                expect(this.view.updateQueryInModel).toHaveBeenCalled();
                expect(this.view.model.get("query")).toBe("select * from hello;")
            });

            it("does not re-render", function() {
                expect(this.view.postRender).not.toHaveBeenCalled();
            });
        });
    });

    describe("#saveChanges", function() {
        beforeEach(function() {
            this.view.render();
            spyOn(chorus.router, "navigate");
            this.view.editor.setValue("select * from table_abc");
            spyOn(this.view.model, "save");
            this.view.trigger("dataset:saveEdit");
            this.clock.tick(1000);

        });
        context("when save succeed", function() {
            beforeEach(function() {
                this.view.model.trigger("saved");
            });
            it("saves the model", function() {
                expect(this.view.model.save).toHaveBeenCalled();
            });

            it("sets the query in the model", function() {
                expect(this.view.model.get("query")).toBe("select * from table_abc");
            });

            it("should return the user to the standard page view", function() {
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.view.model.showUrl(), true)
            });
        });

        context("when save fails", function() {
            beforeEach(function() {
                this.view.model.set({serverErrors: [
                    { message: "SQL error!" }
                ]})
                this.view.model.trigger("saveFailed");
                this.view.render();
            });
            it("displays the error message", function() {
                expect(this.view.$(".errors ul li").text()).toBe("SQL error!");
            })
        })
    });
});
