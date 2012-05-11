require 'spec_helper'

describe HadoopInstancesController do
  before do
    @user = FactoryGirl.create :user
    log_in @user
  end

  describe "#create" do
    context "with valid attributes" do
      let(:valid_attributes) { Hash.new }

      before do
        instance = FactoryGirl.build(:hadoop_instance, :name => "new")
        stub(Hdfs::InstanceRegistrar).create!(valid_attributes, @user) { instance }
      end

      it "reports that the instance was created" do
        post :create, :hadoop_instance => valid_attributes
        response.code.should == "201"
      end

      it "renders the newly created instance" do
        post :create, :hadoop_instance => valid_attributes
        decoded_response.name.should == "new"
      end
    end

    context "with invalid attributes" do
      let(:invalid_attributes) { Hash.new }

      before do
        instance = FactoryGirl.build(:hadoop_instance, :name => nil)
        stub(Hdfs::InstanceRegistrar).create!(invalid_attributes, @user) { raise(ActiveRecord::RecordInvalid.new(instance)) }
      end

      it "responds with validation errors" do
        post :create, :hadoop_instance => invalid_attributes
        response.code.should == "422"
      end
    end
  end
end
