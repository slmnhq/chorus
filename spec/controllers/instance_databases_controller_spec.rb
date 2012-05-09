require 'spec_helper'

describe InstanceDatabasesController do
  let!(:dbconfig) {YAML.load_file("config/database.yml")[Rails.env]}
  let!(:user) { FactoryGirl.create :user}

  before do
    log_in user
  end

  describe "#index" do
    it "fails without instance id" do
      get :index
      response.code.should == "404"
    end

    context "with instance id" do
      it "when no such instance should fail" do
        get :index, :instance_id => 12345
        response.code.should == "404"
      end

      context "when no account for this instance" do
        let!(:instance) {FactoryGirl.create :instance, :host => dbconfig["host"]||"localhost", :port => dbconfig["port"], :shared => false}

        it "should fail" do
          get :index, :instance_id => instance.id
          response.code.should == "404"
        end
      end

      context "when instance and account available" do
        let!(:instance) {FactoryGirl.create :instance, :host => dbconfig["host"]||"localhost", :port => dbconfig["port"], :shared => false}
        let!(:account) {FactoryGirl.create :instance_account, :instance_id => instance.id, :owner_id => user.id, :db_username => dbconfig["username"], :db_password => dbconfig["password"]}

        context "when unable to connect to instance" do
          before do
            instance.update_attribute :host, "no.such.host"
          end

          it "should fail" do
            get :index, :instance_id => instance.id
            response.code.should == "422"
          end
        end

        context "when able to connect to instance" do
          let!(:instance) {FactoryGirl.create :instance, :host => dbconfig["host"]||"localhost", :port => dbconfig["port"], :shared => false}
          let!(:account) {FactoryGirl.create :instance_account, :instance_id => instance.id, :owner_id => user.id, :db_username => dbconfig["username"], :db_password => dbconfig["password"]}

          it "should succeed" do
            get :index, :instance_id => instance.id
            response.code.should == "200"
            decoded_response[0].instance_id.should == instance.id
          end
        end
      end
    end
  end
end
