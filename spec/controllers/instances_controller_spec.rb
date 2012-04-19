require 'spec_helper'

describe InstancesController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
    @instance1 = FactoryGirl.create(:instance)
    @instance2 = FactoryGirl.create(:instance)
  end

  it "#index" do
    get :index
    response.code.should == "200"
    decoded_response.length.should == 2

    decoded_response[0].name.should == @instance1.name
    decoded_response[0].host.should == @instance1.host
    decoded_response[0].port.should == @instance1.port
    decoded_response[0].id.should == @instance1.id

    decoded_response[1].name.should == @instance2.name
    decoded_response[1].host.should == @instance2.host
    decoded_response[1].port.should == @instance2.port
    decoded_response[1].id.should == @instance2.id
  end

  describe "#update" do
    it "should not allow non-admin/owner do it" do
      put :update, :id => @instance1.id, :instance => {:name => "changed"}
      response.code.should == "401"
    end

    context "logged-in as admin" do
      before do
        @user.admin = true
        @user.save!
        log_in @user
      end

      it "should work" do
        put :update, :id => @instance1.id, :instance => {:name => "changed", :port => 12345, :host => "server.emc.com"}
        instance = Instance.find(@instance1.id)
        instance.host.should == "server.emc.com"
        instance.name.should == "changed"
        instance.port.should == 12345
      end

      it "should not allow changing Id" do
        put :update, :id => @instance1.id, :instance => {:id => 122222}
        instance = Instance.find(@instance1.id)
        instance.id.should_not == 122222
      end
    end

    context "logged in as instance-owner" do
      before do
        @instance1.owner = @user.username
        @instance1.save!
      end

      it "should work" do
        put :update, :id => @instance1.id, :instance => {:name => "changed", :port => 12345, :host => "server.emc.com"}
        instance = Instance.find(@instance1.id)
        instance.host.should == "server.emc.com"
        instance.name.should == "changed"
        instance.port.should == 12345
      end

      it "should not allow changing Id" do
        put :update, :id => @instance1.id, :instance => {:id => 122222}
        instance = Instance.find(@instance1.id)
        instance.id.should_not == 122222
      end
    end
  end

  describe "#create" do
    let(:valid_attributes) do
      {
          :name => "new",
          :port => 12345,
          :host => "server.emc.com",
          :maintenance_db => "postgres",
          :db_username => "test_db",
          :db_password => "pw12345"
      }
    end

    it "reports that the instance was created" do
      post :create, :instance => valid_attributes
      response.code.should == "201"
    end

    it "saves the instance to the database" do
      expect {
        post :create, :instance => valid_attributes
      }.to change { Instance.count }.by(1)
    end

    it "renders the newly created instance" do
      post :create, :instance => valid_attributes
      decoded_response.name.should == "new"
    end
  end
end