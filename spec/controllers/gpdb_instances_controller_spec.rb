require 'spec_helper'

describe GpdbInstancesController do
  ignore_authorization!

  before do
    @user = users(:owner)
    log_in @user
  end

  describe "#index" do
    before do
      FactoryGirl.create(:gpdb_instance)
      FactoryGirl.create(:gpdb_instance, :owner => @user)
      FactoryGirl.create(:gpdb_instance, :shared => true)
      FactoryGirl.create(:instance_account, :owner => @user) # Creates a gpdb_instance too
      FactoryGirl.create(:gpdb_instance, :owner => @user, :state => 'offline')
    end

    it "returns all gpdb instances" do
      get :index
      response.code.should == "200"
      decoded_response.size.should == GpdbInstance.count
    end

    it "returns gpdb instances to which the user has access, if requested" do
      get :index, :accessible => "true"
      response.code.should == "200"
      decoded_response.size.should == GpdbInstanceAccess.gpdb_instances_for(@user).count - 1
    end
  end

  describe "#show" do
    let(:gpdb_instance) { FactoryGirl.create(:gpdb_instance) }

    context "with a valid instance id" do
      it "does not require authorization" do
        dont_allow(subject).authorize!.with_any_args
        get :show, :id => gpdb_instance.to_param
      end

      it "succeeds" do
        get :show, :id => gpdb_instance.to_param
        response.should be_success
      end

      it "presents the gpdb instance" do
        mock.proxy(controller).present(gpdb_instance)
        get :show, :id => gpdb_instance.to_param
      end

      generate_fixture "greenplumInstance.json" do
        get :show, :id => gpdb_instance.to_param
      end
    end

    context "with an invalid gpdb instance id" do
      it "returns not found" do
        get :show, :id => 'invalid'
        response.should be_not_found
      end
    end
  end

  describe "#update" do
    let(:changed_attributes) { {"name" => "changed"} }
    let(:gpdb_instance) { FactoryGirl.create(:gpdb_instance) }

    before do
      stub(Gpdb::InstanceRegistrar).update!(gpdb_instance, changed_attributes, @user) { gpdb_instance }
    end

    it "uses authorization" do
      mock(subject).authorize!(:edit, gpdb_instance)
      put :update, :id => gpdb_instance.id, :instance => changed_attributes
    end

    it "should reply with successful update" do
      put :update, :id => gpdb_instance.id, :instance => changed_attributes
      response.code.should == "200"
    end

    it "should handle invalid updates" do
      tmp_gpdb_instance = FactoryGirl.create(:gpdb_instance)
      tmp_gpdb_instance.name = nil
      stub(Gpdb::InstanceRegistrar).update!(tmp_gpdb_instance, changed_attributes, @user) { raise(ActiveRecord::RecordInvalid.new(gpdb_instance)) }
      put :update, :id => tmp_gpdb_instance.id, :instance => changed_attributes
      response.code.should == "422"
    end
  end

  describe "#create" do
    it_behaves_like "an action that requires authentication", :put, :update

    context "with register provision type" do
      let(:valid_attributes) { Hash.new }

      before do
        gpdb_instance = FactoryGirl.build(:gpdb_instance, :name => "new")
        mock(Gpdb::InstanceRegistrar).create!(valid_attributes, @user, anything) { gpdb_instance }
      end

      it "reports that the gpdb instance was created" do
        post :create, :instance => valid_attributes
        response.code.should == "201"
      end

      it "renders the newly created gpdb instance" do
        post :create, :instance => valid_attributes
        decoded_response.name.should == "new"
      end
    end

    context "with create provision type" do
      let(:valid_attributes) do
        HashWithIndifferentAccess.new({
                                          :provision_type => 'create',
                                          :name => 'instance_name',
                                          :description => 'A description',
                                          :db_username => 'gpadmin',
                                          :db_password => 'secret'
                                      })
      end

      it "reports that the instance was created" do
        post :create, :instance => valid_attributes
        response.code.should == "201"
      end

      it "renders the newly created instance" do
        post :create, :instance => valid_attributes
        decoded_response.name.should == "instance_name"
      end

      it "creates a greenplum instance" do
        post :create, :instance => valid_attributes

        gpdb_instance = GpdbInstance.last
        gpdb_instance.name.should == 'instance_name'
        gpdb_instance.description.should == 'A description'
        gpdb_instance.owner.should == @user
      end

      it "enqueues a request to provision a database for an instance" do
        mock(Gpdb::InstanceRegistrar).create!.with_any_args do
          gpdb_instance = gpdb_instances(:aurora)
          gpdb_instance.id = 123
          gpdb_instance
        end
        mock(QC.default_queue).enqueue("AuroraProvider.provide!", 123, valid_attributes)
        post :create, :instance => valid_attributes
      end
    end

    context "with invalid attributes" do
      let(:invalid_attributes) { Hash.new }

      before do
        gpdb_instance = FactoryGirl.build(:gpdb_instance, :name => nil)
        stub(Gpdb::InstanceRegistrar).create!(invalid_attributes, @user, anything) { raise(ActiveRecord::RecordInvalid.new(gpdb_instance)) }
      end

      it "responds with validation errors" do
        post :create, :instance => invalid_attributes
        response.code.should == "422"
      end
    end
  end
end
