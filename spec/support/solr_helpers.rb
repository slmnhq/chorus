module SolrHelpers

  def reindex_solr_fixtures
    VCR.use_cassette('search_solr_index') do
      Sunspot.session = Sunspot.session.original_session
      Sunspot.session.remove_all
      Sunspot.searchable.each do |model|
        model.solr_index(:batch_commit => false)
      end
      Sunspot.commit
    end
  end
end
