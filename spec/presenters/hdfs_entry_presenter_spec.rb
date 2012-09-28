require 'spec_helper'

describe HdfsEntryPresenter, :type => :view do
  let(:hadoop_instance) { hadoop_instances(:hadoop) }

  let(:options) {{}}
  let(:presenter) { HdfsEntryPresenter.new(entry, view, options) }

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }
    context "for a directory" do
      let(:entry) do
        hadoop_instance.hdfs_entries.create!({
           :path => "/data",
           :modified_at => "2010-10-20 10:11:12",
           :size => '10',
           :is_directory => 'true',
           :content_count => 1,
           :hadoop_instance => hadoop_instance
       }, :without_protection => true)
      end
      before do
        mock(entry).ancestors { [{:name => "foo", :id => 1}] }
        stub(entry).entries { [] }
      end

      it "includes the fields" do
        hash[:id].should == entry.id
        hash[:name].should == "data"
        hash[:path].should == "/"
        hash[:last_updated_stamp].should == "2010-10-20T10:11:12Z"
        hash[:size].should == 10
        hash[:is_dir].should be_true
        hash[:count].should be(1)
        hash[:hadoop_instance][:id].should == hadoop_instance.id
        hash[:hadoop_instance][:name].should == hadoop_instance.name
        hash[:ancestors].should == [{:name => "foo", :id => 1}]
        hash.should_not have_key(:contents)
        hash.should_not have_key(:entries)
      end

      context "when deep option is specified" do
        let(:options) {{:deep => true}}

        it "includes entries" do
          hash[:id].should == entry.id
          hash[:entries].should == []
        end
      end
    end

    context "for a file" do
      let(:entry) do
        hadoop_instance.hdfs_entries.create!({
             :path => "/data",
             :modified_at => "2010-10-20 10:11:12",
             :size => '10',
             :is_directory => 'false',
             :content_count => 1,
             :hadoop_instance => hadoop_instance
         }, :without_protection => true)
      end

      before do
        mock(entry).ancestors { [{:name => "foo", :id => 1}] }
        stub(entry).contents { "Content" }
      end

      it "includes the fields" do
        hash[:id].should == entry.id
        hash[:name].should == "data"
        hash[:path].should == "/data"
        hash[:last_updated_stamp].should == "2010-10-20T10:11:12Z"
        hash[:size].should == 10
        hash[:is_dir].should be_false
        hash[:hadoop_instance][:id].should == hadoop_instance.id
        hash[:hadoop_instance][:name].should == hadoop_instance.name
        hash[:ancestors].should == [{:name => "foo", :id => 1}]
        hash.should_not have_key(:contents)
        hash.should_not have_key(:entries)
      end

      context "when deep option is specified" do
        let(:options) {{:deep => true}}

        it "includes contents" do
          hash[:id].should == entry.id
          hash[:contents].should == "Content"
        end
      end
    end
  end

  describe "complete_json?" do
    let(:entry) { hdfs_entries(:hdfs_file) }
    context "when deep is not specified" do
      it "is not true" do
        presenter.complete_json?.should_not be_true
      end
    end

    context "when deep is specified" do
      let(:options) { {:deep => true} }
      it "is true" do
        presenter.complete_json?.should be_true
      end
    end
  end
end

