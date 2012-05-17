require 'spec_helper'

describe InstanceDatabasesController do
  let!(:dbconfig) { YAML.load_file("config/database.yml")[Rails.env] }
  let!(:user) { FactoryGirl.create :user }

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

      context "when instance inaccessible" do
        let!(:instance) { FactoryGirl.create :instance, :shared => false }

        it "should fail" do
          get :index, :instance_id => instance.id
          response.code.should == "404"
        end
      end

      context "when instance accessible" do
        let(:instance) { FactoryGirl.create :instance, :shared => true }
        let!(:owner_account) { FactoryGirl.create :instance_account, :instance => instance, :owner => instance.owner }

        context "when the refresh of the db fails" do
          before do
            stub(GpdbDatabase).refresh { raise PG::Error.new }
          end

          it "should fail" do
            get :index, :instance_id => instance.id
            response.code.should == "422"
          end
        end

        context "when refresh of the db succeeds" do
          let(:database) { FactoryGirl.create(:gpdb_database, :instance => instance) }

          before do
            stub(GpdbDatabase).refresh { [database] }
          end

          it "should succeed" do
            get :index, :instance_id => instance.id
            response.code.should == "200"
            decoded_response[0].id.should == database.id
            decoded_response[0].instance_id.should == instance.id
          end
        end
      end
    end
  end

  describe "#show" do
    let(:database) { FactoryGirl.create(:gpdb_database) }

    before do
      stub(AccessPolicy).databases_for(user) { GpdbDatabase }
    end

    it "renders the database" do
      get :show, :id => database.to_param
      response.code.should == "200"
      decoded_response.instance_id.should == database.instance.id
      decoded_response.instance_name.should == database.instance.name
      decoded_response.id.should == database.id
      decoded_response.name.should == database.name
    end

    context "when an account can't be found" do
      before do
        stub(AccessPolicy).databases_for(user) { GpdbDatabase.where(:id => -1) }
      end

      it "returns 404" do
        get :show, :id => database.to_param
        response.code.should == "404"
      end
    end

    context "when the db can't be found" do
      it "returns 404" do
        get :show, :id => "-1"
        response.code.should == "404"
      end
    end
  end
end
