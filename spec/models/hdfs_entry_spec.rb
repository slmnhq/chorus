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
             },
             {
                 "path" => "/empty.png",
                 "size" => 10,
                 "is_directory" => "false",
                 "modified_at" => "2010-10-20 22:00:00",
                 'content_count' => 0
             }]
          end
        end
      end

      it "converts hdfs query results into entries" do
        list = described_class.list('/', hadoop_instance).sort_by(&:path)
        first_result = list.first

        first_result.is_directory.should be_true
        first_result.path.should == '/empty'
        first_result.size.should == 10
        first_result.content_count.should == 0
        first_result.modified_at.should == Time.parse("2010-10-20 22:00:00")
        first_result.hadoop_instance.should == hadoop_instance

        last_result = list.last
        last_result.path.should == '/empty.png'
        last_result.is_directory.should be_false
      end

      it "saves the hdfs entries to the database" do
        expect { described_class.list('/', hadoop_instance) }.to change(HdfsEntry, :count).by(2)

        last_entry = HdfsEntry.last
        last_entry.path.should == '/empty.png'
        last_entry.hadoop_instance.should == hadoop_instance
        last_entry.modified_at.should == Time.parse("2010-10-20 22:00:00")
        last_entry.size.should == 10
        last_entry.is_directory.should == false
        last_entry.content_count.should == 0
      end

      it "stores a unique hdfs entry in the database" do
        expect { described_class.list('/', hadoop_instance) }.to change(HdfsEntry, :count).by(2)
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

  describe "search fields" do
    let(:hdfs_entry) { HdfsEntry.new({:path => "/foo/bar/baz.txt"}, :without_protection => true) }

    it "returns the file name for name" do
      hdfs_entry.name.should == 'baz.txt'
    end

    it "returns the directory name for parent_name" do
      hdfs_entry.parent_name.should == 'bar'
    end

    it "indexes text fields" do
      HdfsEntry.should have_searchable_field :name
      HdfsEntry.should have_searchable_field :parent_name
    end

    it "should index files" do
      mock(hdfs_entry).solr_index
      hdfs_entry.save!
    end

    it "does not index directories" do
      hdfs_entry = HdfsEntry.new({:path => "/foo/bar/baz", :is_directory => true}, :without_protection => true)
      dont_allow(hdfs_entry).solr_index
      hdfs_entry.save!
    end

    #it "un-indexes the dataset when it becomes stale" do
    #  mock(dataset).solr_remove_from_index
    #  dataset.stale_at = Time.now
    #  dataset.save!
    #end
    #
    #it "re-indexes the dataset when it becomes un stale" do
    #  dataset.stale_at = Time.now
    #  dataset.save!
    #  mock(dataset).solr_index
    #  dataset.stale_at = nil
    #  dataset.save!
    #end
  end

  describe "#parent_path" do
    it "should not include the file name" do
      HdfsEntry.new({:path => "/foo.txt"}, :without_protection => true).parent_path.should == '/'
      HdfsEntry.new({:path => "/bar/foo.txt"}, :without_protection => true).parent_path.should == '/bar'
      HdfsEntry.new({:path => "/baz/bar/foo.txt"}, :without_protection => true).parent_path.should == '/baz/bar'
    end
  end

  describe "#highlighted_attributes" do
    it "includes path in the highlighted attributes" do
      hdfs_entry = HdfsEntry.new({:path => "/foo.txt"}, :without_protection => true)
      hdfs_entry.highlighted_attributes = { :name => [""] }
      hdfs_entry.highlighted_attributes.should have_key(:path)
    end
  end

  describe "#highlighted_path" do
    it "includes highlighted parent name and not file name" do
      hdfs_entry = HdfsEntry.new({:path => "/foo/bar/baz.txt"}, :without_protection => true)
      hdfs_entry.highlighted_attributes = { :parent_name => ["BAD"] }
      hdfs_entry.highlighted_path.should == "/foo/BAD"
    end

    it "returns path without file if nothing is highlighted" do
      hdfs_entry = HdfsEntry.new({:path => "/foo/bar/baz.txt"}, :without_protection => true)
      hdfs_entry.highlighted_attributes = {}
      hdfs_entry.highlighted_path.should == "/foo/bar"
    end
  end
end