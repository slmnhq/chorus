require 'spec_helper'

describe InstanceCredentialsController do
  let(:admin) {FactoryGirl.create :admin}
  let(:instance_owner) {FactoryGirl.create :user}
  let(:joe) {FactoryGirl.create :user}
  let(:instance) {FactoryGirl.create :instance, :owner => instance_owner}

  describe "create" do
    context "admin" do
      before do
        log_in admin
      end

      context "shared credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret", :shared => true}
          response.code.should == "201"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "lenny"
          rehydrated_credential.password.should == "secret"
          rehydrated_credential.owner.should == admin
          rehydrated_credential.instance.should == instance
          rehydrated_credential.shared.should be_true
        end
      end

      context "individual credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret"}
          response.code.should == "201"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "lenny"
          rehydrated_credential.password.should == "secret"
          rehydrated_credential.owner.should == admin
          rehydrated_credential.instance.should == instance
          rehydrated_credential.shared.should be_false
        end
      end
    end

    context "instance owner" do
      before do
        log_in instance_owner
      end

      context "shared credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret", :shared => true}
          response.code.should == "201"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "lenny"
          rehydrated_credential.password.should == "secret"
          rehydrated_credential.owner.should == instance_owner
          rehydrated_credential.instance.should == instance
          rehydrated_credential.shared.should be_true
        end
      end

      context "individual credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret"}
          response.code.should == "201"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "lenny"
          rehydrated_credential.password.should == "secret"
          rehydrated_credential.owner.should == instance_owner
          rehydrated_credential.instance.should == instance
          rehydrated_credential.shared.should be_false
        end
      end
    end

    context "regular joe" do
      before do
        log_in joe
      end

      it "creates only individual credentials" do
        post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret", :shared => true}
        response.code.should == "201"
        credentials = InstanceCredential.find(decoded_response.id)
        credentials.should be_present
        credentials.username.should == "lenny"
        credentials.password.should == "secret"
        credentials.owner.should == joe
        credentials.instance.should == instance
        credentials.shared.should be_false
      end
    end
  end

  describe "#update" do
    let(:credential) {FactoryGirl.create :instance_credential, :instance => instance, :owner => instance_owner, :shared => false}

    context "admin" do
      before do
        log_in admin
      end

      it "succeeds" do
        put :update, :id => credential.id, :credential => {:username => "changed", :password => "changed", :shared => true}
        response.code.should == "200"
        credential = InstanceCredential.find(decoded_response.id)
        credential.should be_present
        credential.username.should == "changed"
        credential.password.should == "changed"
        credential.shared.should be_true
        credential.owner.should == instance_owner
      end
    end

    context "instance owner" do
      before do
        log_in instance_owner
      end

      it "succeeds" do
        put :update, :id => credential.id, :credential => {:username => "changed", :password => "changed", :shared => true}
        response.code.should == "200"
        rehydrated_credential = InstanceCredential.find(decoded_response.id)
        rehydrated_credential.should be_present
        rehydrated_credential.username.should == "changed"
        rehydrated_credential.password.should == "changed"
        rehydrated_credential.shared.should be_true
        rehydrated_credential.owner.should == instance_owner
      end
    end

    context "regular joe" do
      before do
        log_in joe
      end

      context "someone else's credential'" do
        it "fails" do
          put :update, :id => credential.id, :credential => {:username => "changed", :password => "changed", :shared => true}
          response.should be_forbidden
        end
      end

      context "his own credential" do
        before do
          credential.owner = joe
          credential.save!
        end

        it "succeeds but does not let him set shared=true" do
          put :update, :id => credential.id, :credential => {:username => "changed", :password => "changed", :shared => true}
          response.code.should == "200"
          rehydrated_credential = InstanceCredential.find(decoded_response.id)
          rehydrated_credential.should be_present
          rehydrated_credential.username.should == "changed"
          rehydrated_credential.password.should == "changed"
          rehydrated_credential.shared.should be_false
          rehydrated_credential.owner.should == joe
        end
      end
    end
  end
end