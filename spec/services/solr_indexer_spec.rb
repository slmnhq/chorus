require 'spec_helper'

describe SolrIndexer do
  describe ".refresh_and_index" do
    before do
      mock(SolrIndexer).index('some stuff to index')
    end

    it "refreshes all instances, then refreshes all their databases with the instance accounts" do
      instance_count = 0
      any_instance_of(Instance) do |instance|
        stub(instance).refresh_databases { instance_count += 1 }
      end

      Instance.all.each do |instance|
        instance.databases.each do |database|
          mock(GpdbSchema).refresh(instance.owner_account, database, :mark_stale => true, :refresh_all => true)
        end
      end

      SolrIndexer.refresh_and_index('some stuff to index')

      instance_count.should == Instance.count
    end
  end

  describe ".index" do
    subject { SolrIndexer.index(to_index) }

    before do
      mock(Sunspot).commit
    end

    context "when passed one type to index" do
      let(:to_index) { 'Dataset' }

      it "should index datasets" do
        dont_allow(Dataset).solr_reindex
        mock(Dataset).solr_index
        subject
      end
    end

    context "when passed more than one type to index" do
      let(:to_index) { ['Dataset', 'Instance'] }

      it "should index all types" do
        mock(Dataset).solr_index
        mock(Instance).solr_index
        subject
      end
    end

    context "when told to index all indexable types" do
      let(:to_index) { 'all' }

      it "should index all types" do
        Sunspot.searchable.each do |type|
          mock(type).solr_index
        end
        subject
      end
    end
  end
end
