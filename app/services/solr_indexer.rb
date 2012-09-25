module SolrIndexer
  def self.refresh_and_reindex(types)
    self.refresh_external_data
    self.reindex(types)
  end

  def self.reindex(types)
    Rails.logger.info("Starting Solr Re-Index")
    types_to_index(types).each(&:solr_reindex)
    Sunspot.commit
    Rails.logger.info("Solr Re-Index Completed")
  end

  def self.refresh_external_data
    Rails.logger.info("Starting Solr Refresh")
    GpdbInstance.find_each do |gpdb_instance|
      gpdb_instance.refresh_all(:mark_stale => true)
    end
    HadoopInstance.find_each do |hadoop_instance|
      hadoop_instance.refresh
    end
    Rails.logger.info("Solr Refresh Completed")
  end

  private

  def self.types_to_index(types)
    types = Array(types)

    if types.include? "all"
      Sunspot.searchable
    else
      types.map(&:constantize)
    end
  end
end