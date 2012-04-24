require 'spec_helper'

describe InstanceCredentialsController do
  let(:user) {FactoryGirl.create :user}
  let(:instance) {FactoryGirl.create :instance}

  before do
  end

  describe "create" do
    context "admin" do
      before do
        user.admin = true
        user.save!
        log_in user
      end

      context "shared credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret", :shared => true}
          response.code.should == "201"
          credentials = InstanceCredential.find(decoded_response.id)
          credentials.should be_present
          credentials.username.should == "lenny"
          credentials.password.should == "secret"
          credentials.owner.should == user
          credentials.instance.should == instance
          credentials.shared.should be_true
        end
      end

      context "individual credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret"}
          response.code.should == "201"
          credentials = InstanceCredential.find(decoded_response.id)
          credentials.should be_present
          credentials.username.should == "lenny"
          credentials.password.should == "secret"
          credentials.owner.should == user
          credentials.instance.should == instance
          credentials.shared.should be_false
        end
      end
    end

    context "instance owner" do
      before do
        log_in user
        instance.owner = user
        instance.save!
      end

      context "shared credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret", :shared => true}
          response.code.should == "201"
          credentials = InstanceCredential.find(decoded_response.id)
          credentials.should be_present
          credentials.username.should == "lenny"
          credentials.password.should == "secret"
          credentials.owner.should == user
          credentials.instance.should == instance
          credentials.shared.should be_true
        end
      end

      context "individual credentials" do
        it "get saved correctly" do
          post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret"}
          response.code.should == "201"
          credentials = InstanceCredential.find(decoded_response.id)
          credentials.should be_present
          credentials.username.should == "lenny"
          credentials.password.should == "secret"
          credentials.owner.should == user
          credentials.instance.should == instance
          credentials.shared.should be_false
        end
      end
    end

    context "regular joe" do
      before do
        log_in user
      end

      it "creates only individual credentials" do
        post :create, :credential => {:instance_id => instance.id, :username => "lenny", :password => "secret", :shared => true}
        response.code.should == "201"
        credentials = InstanceCredential.find(decoded_response.id)
        credentials.should be_present
        credentials.username.should == "lenny"
        credentials.password.should == "secret"
        credentials.owner.should == user
        credentials.instance.should == instance
        credentials.shared.should be_false
      end
    end
  end
end