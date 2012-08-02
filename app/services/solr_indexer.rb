module SolrIndexer
  def self.index
    now = Time.now
    Dataset.where(:stale_at => nil).update_all(:stale_at => now)

    Instance.find_each do |instance|
      instance.refresh_databases

      instance.databases.each do |database|
        GpdbSchema.refresh(instance.owner_account, database, true)
      end
    end

    Dataset.solr_index
    Dataset.where("stale_at is not null").each { |d| d.solr_remove_from_index }
    Sunspot.commit
  end
end