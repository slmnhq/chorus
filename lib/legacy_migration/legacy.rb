class Legacy
  def self.connection
    ActiveRecord::Base.postgresql_connection(
        :host => 'localhost',
        :port => '8543',
        :database => 'chorus_rails_test',
        :username => 'pivotal',
        :password => '',
        :adapter => 'jdbcpostgresql',
        :schema_search_path => 'public, legacy_migrate'
    )
  end
end