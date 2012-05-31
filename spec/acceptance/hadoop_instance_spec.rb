require 'spec_helper'

resource "Hadoop DB instances" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:instance) { FactoryGirl.create(:hadoop_instance, :owner => owner, :host => 'garcia', :port => '8020', :username => 'pivotal', :group_list => 'pivotal') }
  let!(:entry1) { HdfsEntry.new('path' => '/files', 'modifiedAt' => Time.now.to_s, 'directory' => "true", 'contentCount' => "3") }
  let!(:entry2) { HdfsEntry.new('path' => 'test.txt', 'modifiedAt' => Time.now.to_s, 'size' => "1234kB") }
  let(:hadoop_instance_id) { instance.to_param }

  before do
    log_in owner
    stub(Gpdb::ConnectionChecker).check! { true }
    stub(Hdfs::QueryService).instance_version(anything) { "1.0.0" }

    service = Object.new
    stub(Hdfs::QueryService).new(instance) { service }
    stub(service).show('/file') { ["This is such a nice file. It's my favourite file. I could read this file all day.'"] }
    stub(HdfsEntry).list('/', instance) { [entry1, entry2] }
    stub(HdfsEntry).list('/files/', instance) { [entry1] }
  end

  post "/hadoop_instances" do
    parameter :name, "Instance alias"
    parameter :description, "Description"
    parameter :host, "Host IP or address"
    parameter :port, "Port"
    parameter :username, "Username for connection"
    parameter :group_list, "Group list for connection"

    let(:name) { "Sesame Street" }
    let(:description) { "Can you tell me how to get..." }
    let(:host) { "sesame.street.local" }
    let(:port) { "8020" }
    let(:username) { "big" }
    let(:group_list) { "bird" }

    required_parameters :name, :host, :port, :username, :group_list
    scope_parameters :hadoop_instance, :all

    example_request "Register a Hadoop database" do
      status.should == 201
    end
  end

  get "/hadoop_instances" do
    example_request "Get a list of registered Hadoop databases" do
      status.should == 200
    end
  end

  get "/hadoop_instances/:id" do
    let(:id) { instance.to_param }

    example_request "Show instance details"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/files" do
    example_request "Get a list of files for a specific hadoop instance's root directory"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/contents/:id" do
    let(:id) { "%2Ffile" }

    example_request "Get the contents of a file for a specific hadoop instance"  do
      status.should == 200
    end
  end

  get "/hadoop_instances/:hadoop_instance_id/files/:id" do
    let(:id) { "%2Ffiles" }

    example_request "Get a list of files for a subdirectory of a specific hadoop instance"  do
      status.should == 200
    end
  end
end

 
