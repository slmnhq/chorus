require "spec_helper"

describe HdfsEntry do
  describe "associations" do
    it { should belong_to(:hadoop_instance) }
  end

  describe "validations" do
    it "should validate uniqueness of path, scoped to hadoop_instance_id" do
      existing_entry = HdfsEntry.last
      duplicate_entry = HdfsEntry.new
      duplicate_entry.hadoop_instance = existing_entry.hadoop_instance
      duplicate_entry.path = existing_entry.path
      duplicate_entry.should_not be_valid
      duplicate_entry.errors.count.should == 1
    end
  end

  describe ".list" do
    context "queries the hdfs query system and retrieve entries objects" do
      let(:hadoop_instance) { hadoop_instances(:hadoop) }

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

      it "saves the hdfs entries to the database" do
        expect { described_class.list('/', hadoop_instance) }.to change(HdfsEntry, :count).by(1)
        HdfsEntry.last.path.should == '/empty'
        HdfsEntry.last.hadoop_instance.should == hadoop_instance
      end

      it "stores a unique hdfs entry in the database" do
        expect { described_class.list('/', hadoop_instance) }.to change(HdfsEntry, :count).by(1)
        list_again = nil
        expect { list_again = described_class.list('/', hadoop_instance) }.to change(HdfsEntry, :count).by(0)

        first_result = list_again.first
        first_result.is_directory.should be_true
        first_result.path.should == '/empty'
        first_result.size.should == 10
        first_result.content_count.should == 0
        first_result.modified_at.should == Time.parse("2010-10-20 22:00:00")
        first_result.hadoop_instance.should == hadoop_instance
      end
    end
  end

  describe "#file" do
    let(:hadoop_instance) { FactoryGirl.build_stubbed(:hadoop_instance) }

    let(:directory_entry) do
      HdfsEntry.new({
          :path => "/abc",
          :size => 10,
          :is_directory => true,
          :modified_at => Time.parse("2010-10-20 22:00:00"),
          :content_count => 4,
          :hadoop_instance => hadoop_instance
      }, :without_protection => true)
    end

    let(:file_entry) do
      HdfsEntry.new({
          :path => "/hello.sql",
          :size => 10,
          :is_directory => false,
          :modified_at => Time.parse("2010-10-20 22:00:00"),
          :size => 4096,
          :hadoop_instance => hadoop_instance
      }, :without_protection => true)
    end

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
