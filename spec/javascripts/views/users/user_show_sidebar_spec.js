describe("chorus.views.UserShowSidebar", function(){
    beforeEach(function(){
        this.loadTemplate("user_show_sidebar");

        this.user = new chorus.models.User({username: "bill"})
    });

    describe("#render", function() {
        context("when logged in as an admin", function(){
            beforeEach(function() {
                setLoggedInUser({admin: true});
                this.view = new chorus.views.UserShowSidebar({model: this.user});
                this.view.render();
            }) 

            it("should have actions", function(){
                expect(this.view.$(".actions")).toExist();
            });

            context("clicking the delete User link", function(){
                beforeEach(function(){
                    this.view.$("a.delete_user").click()
                })
                
                it("launches a delete user alert", function(){
                   expect(chorus.modal instanceof chorus.alerts.UserDelete).toBeTruthy();
                }) 
            })
        })
    }) 

    context("when logged in as an non-admin", function(){
        beforeEach(function(){
            setLoggedInUser({admin: false});
            this.view = new chorus.views.UserShowSidebar({model: this.user});
            this.view.render();
        });

        it("shouldn't have actions", function(){
            expect(this.view.$(".actions")).not.toExist();
        });
    })
});
