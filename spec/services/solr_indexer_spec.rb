require 'spec_helper'

describe SolrIndexer do
  describe ".refresh_and_index", :database_integration do
    before do
      @real_gpdb_account = instance_accounts(:chorus_gpdb42_gpadmin)
      Instance.where("name NOT LIKE 'chorus_gpdb%'").destroy_all
      Dataset.destroy_all
      refresh_chorus
      mock(SolrIndexer).index('some stuff to index')
    end

    let(:instance_41) { instances(:chorus_gpdb41) }
    let(:instance_42) { instances(:chorus_gpdb42) }
    let(:database) { GpdbDatabase.find_by_name(GpdbIntegration.database_name) }
    let(:test_schema) { database.schemas.find_by_name("test_schema") }

    let(:stale_dataset_name) { 'table_to_drop_for_solr_indexer' }
    let!(:stale_dataset) { GpdbTable.create!({:name => stale_dataset_name, :schema => test_schema}, :without_protection => true) }

    subject { SolrIndexer.refresh_and_index('some stuff to index') }

    it "should mark datasets as stale" do
      subject
      stale_dataset.reload.should be_stale
    end

    it "should refresh the databases (and permissions) for all instances" do
      database.instance_accounts.should be_empty
      subject
      database.reload.instance_accounts.should_not be_empty
    end

    it "should refresh the schemas/datasets for all instances" do
      subject
      database.schemas.find_by_name("test_schema").datasets.where(['id != ?', stale_dataset.id]).each do |dataset|
        dataset.should_not be_stale
      end
    end
  end

  describe ".index" do
    subject { SolrIndexer.index(to_index) }

    before do
      mock(Sunspot).commit
    end

    context "when passed one type to index" do
      let(:to_index) { 'Dataset' }

      it "should re-index datasets" do
        mock(Dataset).solr_reindex
        subject
      end
    end

    context "when passed more than one type to index" do
      let(:to_index) { ['Dataset', 'Instance'] }

      it "should re-index all types" do
        mock(Dataset).solr_reindex
        mock(Instance).solr_reindex
        subject
      end
    end

    context "when told to index all indexable types" do
      let(:to_index) { 'all' }

      it "should re-index all types" do
        Sunspot.searchable.each do |type|
          mock(type).solr_reindex
        end
        subject
      end
    end
  end
end
