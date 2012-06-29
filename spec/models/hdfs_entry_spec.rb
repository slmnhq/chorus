require "spec_helper"

describe HdfsEntry do
  let(:hadoop_instance) { FactoryGirl.build_stubbed(:hadoop_instance) }

  let(:directory_entry) do
    HdfsEntry.new({
      "path" => "/abc",
      "size" => 10,
      "is_directory" => "true",
      "modified_at" => "2010-10-20 22:00:00",
      "content_count" => 4
    }, hadoop_instance)
  end

  let(:file_entry) do
    HdfsEntry.new({
      "path" => "/hello.sql",
      "size" => 10,
      "is_directory" => "false",
      "modified_at" => "2010-10-20 22:00:00",
      'size' => 4096
    }, hadoop_instance)
  end

  describe ".list" do
    context "queries the hdfs query system and retrieve entries objects" do
      let(:hadoop_instance) { HadoopInstance.new(:host => 'garcia', :port => '8020', :username => 'pivotal') }

      before do
        any_instance_of(Hdfs::QueryService) do |h|
          stub(h).list('/') do
            [{
              "path" => "/empty",
              "size" => 10,
              "is_directory" => "true",
              "modified_at" => "2010-10-20 22:00:00",
              'content_count' => 0
            }]
          end
        end
      end

      it "converts hdfs query results into entries" do
        first_result = described_class.list('/', hadoop_instance).sort_by(&:path).first

        first_result.is_directory.should be_true
        first_result.path.should == '/empty'
        first_result.size.should == 10
        first_result.content_count.should == 0
        first_result.modified_at.should == Time.parse("2010-10-20 22:00:00")
        first_result.hadoop_instance.should == hadoop_instance
      end
    end
  end

  describe "constructor" do
    context "convert query response item to hdfs entry" do
      it "converts valid response item to an object" do
        modified_at = Time.new(2010, 10, 20, 22, 00, 00)

        directory_entry.path.should == "/abc"
        directory_entry.size.should == 10
        directory_entry.is_directory.should be_true
        directory_entry.modified_at.should == modified_at
        directory_entry.content_count.should == 4
      end
    end
  end

  describe "#file" do
    context "entry is a directory" do
      it "returns nil" do
        directory_entry.file.should be_nil
      end
    end

    context "entry is a file" do
      it "creates a Hdfs file from the entry" do
        file = file_entry.file

        file.path.should == "/hello.sql"
        file.hadoop_instance.should == hadoop_instance
        file.modified_at.should == file_entry.modified_at
      end
    end
  end
end
