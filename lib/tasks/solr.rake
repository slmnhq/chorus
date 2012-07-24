require 'sunspot'

namespace :services do
  namespace :solr do
    task :run do
      path = File.expand_path(File.dirname(__FILE__) + '/../../config') + '/sunspot.yml'
      log_path = File.expand_path(File.dirname(__FILE__) + '/../../log')

      rails_environment = ENV['RAILS_ENV'] || 'development'

      solr_config = YAML.load_file(path)[rails_environment]

      server = Sunspot::Solr::Server.new
      server.port = solr_config['solr']['port']
      server.log_level = solr_config['solr']['log_level']
      server.solr_data_dir = (Rails.root + "solr/data/#{rails_environment}/").to_s
      server.log_file = log_path + "/solr-#{rails_environment}.log"

      server.run
    end
  end
end