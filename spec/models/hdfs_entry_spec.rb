require "spec_helper"

describe HdfsEntry do
  describe "constructor" do
    context "convert query response item to hdfs entry" do
      it "should convert valid response item to an object" do
        hdfs_entry = HdfsEntry.new("path" => "/abc", "size" => "10", "directory" => "true", "modifiedAt" => "2010-10-20 22:00:00")

        modified_at = Time.new(2010, 10, 20, 22, 00, 00)

        hdfs_entry.path.should == "/abc"
        hdfs_entry.size.should == "10"
        hdfs_entry.is_directory.should be_true
        hdfs_entry.modified_at.should == modified_at
      end
    end
  end

  describe ".list" do
    context "queries the hdfs query system and retrieve entries objects" do
      let(:hadoop_instance) { HadoopInstance.new(:host => 'garcia', :port => '8020', :username => 'pivotal') }

      it "converts hdfs query results into entries" do
        VCR.use_cassette('query_service_list_root') do
          first_result = described_class.list('/', hadoop_instance).sort_by(&:path).first

          first_result.is_directory.should be_true
          first_result.path.should == '/empty'
          first_result.size.should == 0
          first_result.modified_at.should == Time.parse("2012-05-24 11:25:50")
        end
      end
    end
  end
end
