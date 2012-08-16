require 'spec_helper'

describe InstancesController do
  ignore_authorization!

  before do
    @user = users(:bob)
    log_in @user
  end

  describe "#index" do
    before do
      FactoryGirl.create(:instance)
      FactoryGirl.create(:instance, :owner => @user)
      FactoryGirl.create(:instance, :shared => true)
      FactoryGirl.create(:instance_account, :owner => @user) # Creates an instance too
    end

    it "returns all instances" do
      get :index
      response.code.should == "200"
      decoded_response.size.should == Instance.count
    end

    it "returns instances to which the user has access, if requested" do
      get :index, :accessible => "true"
      response.code.should == "200"
      decoded_response.size.should == InstanceAccess.instances_for(@user).count
    end
  end

  describe "#show" do
    let(:instance) { FactoryGirl.create(:instance) }

    context "with a valid instance id" do
      it "does not require authorization" do
        dont_allow(subject).authorize!.with_any_args
        get :show, :id => instance.to_param
      end

      it "succeeds" do
        get :show, :id => instance.to_param
        response.should be_success
      end

      it "presents the instance" do
        mock.proxy(controller).present(instance)
        get :show, :id => instance.to_param
      end

      generate_fixture "greenplumInstance.json" do
        get :show, :id => instance.to_param
      end
    end

    context "with an invalid instance id" do
      it "returns not found" do
        get :show, :id => 'invalid'
        response.should be_not_found
      end
    end
  end

  describe "#update" do
    let(:changed_attributes) { {"name" => "changed"} }
    let(:instance) { FactoryGirl.create(:instance) }

    before do
      stub(Gpdb::InstanceRegistrar).update!(instance, changed_attributes, @user) { instance }
    end

    it "uses authorization" do
      mock(subject).authorize!(:edit, instance)
      put :update, :id => instance.id, :instance => changed_attributes
    end

    it "should reply with successful update" do
      put :update, :id => instance.id, :instance => changed_attributes
      response.code.should == "200"
    end

    it "should handle invalid updates" do
      tmp_instance = FactoryGirl.create(:instance)
      tmp_instance.name = nil
      stub(Gpdb::InstanceRegistrar).update!(tmp_instance, changed_attributes, @user) { raise(ActiveRecord::RecordInvalid.new(instance)) }
      put :update, :id => tmp_instance.id, :instance => changed_attributes
      response.code.should == "422"
    end
  end

  describe "#create" do
    it_behaves_like "an action that requires authentication", :put, :update

    context "with register provision type" do
      let(:valid_attributes) { Hash.new }

      before do
        instance = FactoryGirl.build(:instance, :name => "new")
        mock(Gpdb::InstanceRegistrar).create!(valid_attributes, @user, anything) { instance }
      end

      it "reports that the instance was created" do
        post :create, :instance => valid_attributes
        response.code.should == "201"
      end

      it "renders the newly created instance" do
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

        instance = Instance.last
        instance.name.should == 'instance_name'
        instance.description.should == 'A description'
        instance.owner.should == @user
      end

      it "enqueues a request to provision a database for an instance" do
        mock(Gpdb::InstanceRegistrar).create!.with_any_args do
          instance = instances(:aurora)
          instance.id = 123
          instance
        end
        mock(QC.default_queue).enqueue("AuroraProvider.provide!", 123, valid_attributes)
        post :create, :instance => valid_attributes
      end
    end

    context "with invalid attributes" do
      let(:invalid_attributes) { Hash.new }

      before do
        instance = FactoryGirl.build(:instance, :name => nil)
        stub(Gpdb::InstanceRegistrar).create!(invalid_attributes, @user, anything) { raise(ActiveRecord::RecordInvalid.new(instance)) }
      end

      it "responds with validation errors" do
        post :create, :instance => invalid_attributes
        response.code.should == "422"
      end
    end
  end
end
