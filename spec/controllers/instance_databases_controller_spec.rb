require 'spec_helper'

describe InstanceDatabasesController do
  ignore_authorization!

  let!(:user) { FactoryGirl.create :user }

  before do
    log_in user
  end

  describe "#index" do
    it "fails when no such gpdb instance" do
      get :index, :gpdb_instance_id => 12345
      response.code.should == "404"
    end

    context "when instance accessible" do
      let(:gpdb_instance) { FactoryGirl.create :gpdb_instance, :shared => true }
      let!(:owner_account) { FactoryGirl.create :instance_account, :gpdb_instance => gpdb_instance, :owner => gpdb_instance.owner }
      let!(:database) { FactoryGirl.create(:gpdb_database, :gpdb_instance => gpdb_instance) }
      let!(:database2) { FactoryGirl.create(:gpdb_database, :gpdb_instance => gpdb_instance) }
      let!(:database3) { FactoryGirl.create(:gpdb_database, :gpdb_instance => gpdb_instance) }

      it "checks authorization" do
        stub(GpdbDatabase).refresh { [database] }
        mock(subject).authorize!(:show_contents, gpdb_instance)
        get :index, :gpdb_instance_id => gpdb_instance.id
      end

      context "when the refresh of the db fails" do
        before do
          stub(GpdbDatabase).refresh { raise ActiveRecord::JDBCError.new }
        end

        it "should fail" do
          get :index, :gpdb_instance_id => gpdb_instance.id
          response.code.should == "422"
        end
      end

      context "when refresh of the db succeeds" do
        before do
          stub(GpdbDatabase).refresh { [database, database2] }
        end

        it "should succeed" do
          get :index, :gpdb_instance_id => gpdb_instance.id
          response.code.should == "200"
          decoded_response[0].id.should == database.id
          decoded_response[0].instance.id.should == gpdb_instance.id
          decoded_response.size.should == 2
        end
      end
    end
  end

  describe "#show" do
    let(:database) { FactoryGirl.create(:gpdb_database) }

    it "uses authorization" do
      mock(subject).authorize!(:show_contents, database.gpdb_instance)
      get :show, :id => database.to_param
    end

    it "renders the database" do
      get :show, :id => database.to_param
      response.code.should == "200"
      decoded_response.instance.id.should == database.gpdb_instance.id
      decoded_response.instance.name.should == database.gpdb_instance.name
      decoded_response.id.should == database.id
      decoded_response.name.should == database.name
    end

    generate_fixture "database.json" do
      get :show, :id => database.to_param
    end

    context "when the db can't be found" do
      it "returns 404" do
        get :show, :id => "-1"
        response.code.should == "404"
      end
    end

    context "when the current user does not have credentials for the instance" do
      subject { described_class.new }

      generate_fixture "forbiddenInstance.json" do
        stub(subject).can? { false }
        get :show, :id => database.to_param
        response.should be_forbidden
      end
    end
  end
end
