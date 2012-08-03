module SolrIndexer
  def self.refresh_and_index(types)
    refresh
    index(types)
  end

  def self.index(types)
    types_to_index(types).each(&:solr_reindex)
    Sunspot.commit
  end

  private

  def self.refresh
    now = Time.now
    Dataset.where(:stale_at => nil).update_all(:stale_at => now)

    Instance.find_each do |instance|
      instance.refresh_databases

      instance.databases.each do |database|
        GpdbSchema.refresh(instance.owner_account, database, :mark_stale => true, :refresh_all => true)
      end
    end
  end

  def self.types_to_index(types)
    types = Array(types)

    if types.include? "all"
      Sunspot.searchable
    else
      types.map(&:constantize)
    end
  end
end