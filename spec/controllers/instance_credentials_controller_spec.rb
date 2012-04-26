require 'spec_helper'

describe InstanceCredentialsController do
  let(:admin) {FactoryGirl.create :admin}
  let(:instance_owner) {FactoryGirl.create :user}
  let(:joe) {FactoryGirl.create :user}
  let(:instance) {FactoryGirl.create :instance, :owner => instance_owner}

  describe "#create" do
    context "when admin" do
      before do
        log_in admin
      end

      context "for a shared credentials instance" do
        before do
          instance.update_attribute :shared, true
        end

        context "that does not already have credentials stored" do
          it "get saved correctly" do
            post :create, :instance_id => instance.id, :credential => { :username => "lenny", :password => "secret"}
            response.code.should == "201"
            rehydrated_credential = InstanceCredential.find(decoded_response.id)
            rehydrated_credential.should be_present
            rehydrated_credential.username.should == "lenny"
            rehydrated_credential.password.should == "secret"
            rehydrated_credential.owner.should == admin
            rehydrated_credential.instance.should == instance
          end
        end

        context "that already has credentials stored" do
          before do
            FactoryGirl.create(:instance_credential, :instance => instance)
          end

          it "fails" do
            post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
            response.code.should == "422"
          end
        end
      end

      context "for an individual credentials instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
          response.code.should == "201"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "lenny"
          rehydrated_credential.password.should == "secret"
          rehydrated_credential.owner.should == admin
          rehydrated_credential.instance.should == instance
        end
      end
    end

    context "when instance owner" do
      before do
        log_in instance_owner
      end

      context "for a shared credentials instance" do
        before do
          instance.update_attribute :shared, true
        end

        context "that does not already have credentials stored" do
          it "get saved correctly" do
            post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
            response.code.should == "201"
            rehydrated_credential = InstanceCredential.find(decoded_response.id)
            rehydrated_credential.should be_present
            rehydrated_credential.username.should == "lenny"
            rehydrated_credential.password.should == "secret"
            rehydrated_credential.owner.should == instance_owner
            rehydrated_credential.instance.should == instance
          end
        end

        context "that already has credentials stored" do
          before do
            credential = instance.credentials.build :username => "foo", :password => "bar"
            credential.owner = instance_owner
            credential.save!
          end

          it "fails" do
            post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
            response.code.should == "422"
          end
        end
      end

      context "for an individual credentials instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
          response.code.should == "201"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "lenny"
          rehydrated_credential.password.should == "secret"
          rehydrated_credential.owner.should == instance_owner
          rehydrated_credential.instance.should == instance
        end
      end
    end

    context "when regular joe" do
      before do
        log_in joe
      end

      context "for a shared credentials instance" do
        before do
          instance.update_attribute :shared, true
        end

        context "that does not already have credentials stored" do
          it "fails" do
            post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
            response.code.should == "403"
          end
        end

        context "that already has credentials stored" do
          before do
            InstanceCredential.create :instance_id => instance.id, :username => "foo", :password => "bar"
          end

          it "fails" do
            post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
            response.code.should == "403"
          end
        end
      end

      context "for an individual credentials instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :credential => {:username => "lenny", :password => "secret"}
          response.code.should == "201"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "lenny"
          rehydrated_credential.password.should == "secret"
          rehydrated_credential.owner.should == joe
          rehydrated_credential.instance.should == instance
        end
      end
    end
  end

  describe "#update" do
    let(:credential) { FactoryGirl.create :instance_credential, :instance => instance, :owner => instance_owner }

    context "when admin" do
      before do
        log_in admin
      end

      it "succeeds" do
        put :update, :instance_id => instance.id, :id => credential.id, :credential => {:username => "changed", :password => "changed"}
        response.code.should == "200"
        rehydrated_credential = InstanceCredential.find(decoded_response.id)
        rehydrated_credential.should be_present
        rehydrated_credential.username.should == "changed"
        rehydrated_credential.password.should == "changed"
        rehydrated_credential.owner.should == instance_owner
      end
    end

    context "when instance owner" do
      before do
        log_in instance_owner
      end

      it "succeeds for user's credential" do
        put :update, :instance_id => instance.id, :id => credential.id, :credential => {:username => "changed", :password => "changed"}
        response.code.should == "200"
        rehydrated_credential = InstanceCredential.find(decoded_response.id)
        rehydrated_credential.should be_present
        rehydrated_credential.username.should == "changed"
        rehydrated_credential.password.should == "changed"
        rehydrated_credential.owner.should == instance_owner
      end

      it "fails for other's credential" do
        credential.update_attribute :owner, joe
        put :update, :instance_id => instance.id, :id => credential.id, :credential => {:username => "changed", :password => "changed"}
        response.code.should == "403"
      end
    end

    context "when regular joe" do
      before do
        log_in joe
      end

      context "someone else's credential'" do
        it "fails" do
          put :update, :instance_id => instance.id, :id => credential.id, :credential => {:username => "changed", :password => "changed"}
          response.should be_forbidden
        end
      end

      context "his own credential" do
        before do
          credential.owner = joe
          credential.save!
        end

        it "succeeds" do
          put :update, :instance_id => instance.id, :id => credential.id, :credential => {:username => "changed", :password => "changed"}
          response.code.should == "200"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "changed"
          rehydrated_credential.password.should == "changed"
          rehydrated_credential.owner.should == joe
        end
      end
    end
  end
end