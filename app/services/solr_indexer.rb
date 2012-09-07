module SolrIndexer
  def self.refresh_and_index(types)
    refresh
    index(types)
  end

  def self.index(types)
    Rails.logger.info("Starting Solr Index")
    types_to_index(types).each(&:solr_index)
    Sunspot.commit
    Rails.logger.info("Solr Index Completed")
  end

  private

  def self.refresh
    Rails.logger.info("Starting Solr Refresh")
    GpdbInstance.find_each do |gpdb_instance|
      gpdb_instance.refresh_databases(:mark_stale => true)

      gpdb_instance.databases.each do |database|
        GpdbSchema.refresh(gpdb_instance.owner_account, database, :mark_stale => true, :refresh_all => true)
      end
    end
    HadoopInstance.find_each do |hadoop_instance|
      hadoop_instance.refresh
    end
    Rails.logger.info("Solr Refresh Completed")
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