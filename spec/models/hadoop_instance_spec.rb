require 'spec_helper'

describe HadoopInstance do
  subject { FactoryGirl.build :hadoop_instance }

  describe "associations" do
    it { should belong_to :owner }
    its(:owner) { should be_a User }
    it { should have_many :activities }
    it { should have_many :events }
    it { should have_many :hdfs_entries }
  end

  describe "validations" do
    it { should validate_presence_of :host }
    it { should validate_presence_of :name }
    it { should validate_presence_of :port }
  end

  describe "#refresh" do
    let(:root_file) { HdfsEntry.new({:path => '/foo.txt'}, :without_protection => true) }
    let(:root_dir) { HdfsEntry.new({:path => '/bar', :is_directory => true}, :without_protection => true) }
    let(:deep_dir) { HdfsEntry.new({:path => '/bar/baz', :is_directory => true}, :without_protection => true) }

    it "lists the root directory for the instance" do
      mock(HdfsEntry).list('/', subject) { [root_file, root_dir] }
      mock(HdfsEntry).list(root_dir.path, subject) { [] }
      subject.refresh
    end

    it "recurses through the directory hierarchy" do
      mock(HdfsEntry).list('/', subject) { [root_file, root_dir] }
      mock(HdfsEntry).list(root_dir.path, subject) { [deep_dir] }
      mock(HdfsEntry).list(deep_dir.path, subject) { [] }
      subject.refresh
    end

    context "when the server is not reachable" do
      let(:instance) { hadoop_instances(:hadoop) }
      before do
        any_instance_of(Hdfs::QueryService) do |qs|
          stub(qs).list { raise Hdfs::DirectoryNotFoundError.new("ERROR!") }
        end
      end

      it "marks all the hdfs entries as stale" do
        instance.refresh
        instance.hdfs_entries.size.should > 3
        instance.hdfs_entries.each do |entry|
          entry.should be_stale
        end
      end
    end

    context "when a DirectoryNotFoundError happens on a subdirectory" do
      let(:instance) { hadoop_instances(:hadoop) }
      before do
        any_instance_of(Hdfs::QueryService) do |qs|
          stub(qs).list { raise Hdfs::DirectoryNotFoundError.new("ERROR!") }
        end
      end

      it "does not mark any entries as stale" do
        expect {
          instance.refresh("/foo")
        }.to_not change { instance.hdfs_entries.not_stale.count }
      end
    end
  end
end
