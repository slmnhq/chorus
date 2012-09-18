require 'spec_helper'

describe HadoopInstancesController do
  ignore_authorization!

  let(:hadoop_instance) { hadoop_instances(:hadoop) }

  before do
    @user = users(:no_collaborators)
    log_in @user
  end

  describe "#create" do
    context "with valid attributes" do
      let(:valid_attributes) { Hash.new }

      before do
        stub(Hdfs::InstanceRegistrar).create!(valid_attributes, @user) { hadoop_instance }
      end

      it "reports that the instance was created" do
        post :create, :hadoop_instance => valid_attributes
        response.code.should == "201"
      end

      it "renders the newly created instance" do
        post :create, :hadoop_instance => valid_attributes
        decoded_response.name.should == hadoop_instance.name
      end
    end
  end

  describe "#update" do
    context "with valid attributes" do
      let(:attributes) { {'name' => 'new_name'} }

      before do
        mock(Hdfs::InstanceRegistrar).update!(hadoop_instance.id, attributes, @user)
      end

      it "uses authorization" do
        mock(subject).authorize!(:edit, hadoop_instance)
        put :update, :id => hadoop_instance.id, :hadoop_instance => attributes
      end

      it "responds with validation error" do
        put :update, :id => hadoop_instance.id, :hadoop_instance => attributes
        response.code.should == "200"
      end
    end

    context "with invalid attributes" do
      let(:invalid_attributes) { {'name' => ''} }

      before do
        mock(Hdfs::InstanceRegistrar).update!(hadoop_instance.id, invalid_attributes, @user) do
          raise(ActiveRecord::RecordInvalid.new(hadoop_instance))
        end
      end

      it "responds with validation error" do
        put :update, :id => hadoop_instance.id, :hadoop_instance => invalid_attributes
        response.code.should == "422"
      end
    end
  end

  describe "#index" do
    it "presents all hadoop instances" do
      mock_present { |model| model.should =~ HadoopInstance.all }
      get :index
    end
  end

  describe "#show" do
    it "presents the hadoop instance with the given id" do
      get :show, :id => hadoop_instance.id
      decoded_response.name.should == hadoop_instance.name
    end

    generate_fixture "hadoopInstance.json" do
      get :show, :id => hadoop_instance.id
    end
  end
end
