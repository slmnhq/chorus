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
      before do
        stub(Hdfs::InstanceRegistrar).create!( {}, @user) { hadoop_instance }
      end

      it "reports that the instance was created" do
        post :create
        response.code.should == "201"
      end

      it "renders the newly created instance" do
        post :create
        decoded_response.name.should == hadoop_instance.name
      end

      it "schedules a job to refresh the instance" do
        mock(QC.default_queue).enqueue("HadoopInstance.full_refresh", numeric)
        post :create
      end
    end
  end

  describe "#update" do
    let(:attributes) { {'name' => 'some_random_value'} }
    let(:params) { attributes.merge :id => hadoop_instance }
    let(:fake_instance) { Object.new }

    it "presents a hadoop instance returned by update" do
      mock(Hdfs::InstanceRegistrar).update!(hadoop_instance.id, attributes, @user) { fake_instance }
      it_uses_authorization(:edit, hadoop_instance)
      mock_present { |instance| instance.should == fake_instance }
      put :update, params
    end

    context "when it fails due to validation" do
      let(:attributes) { {'name' => 'some_wrong_value'} }

      before do
        mock(Hdfs::InstanceRegistrar).update!(hadoop_instance.id, attributes, @user) do
          raise(ActiveRecord::RecordInvalid.new(hadoop_instance))
        end
      end

      it "responds with validation error" do
        put :update, params
        response.code.should == "422"
      end
    end
  end

  describe "#index" do
    it "presents all hadoop instances" do
      mock_present { |model| model.should =~ HadoopInstance.all }
      get :index
    end

    it_behaves_like "a paginated list"
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
