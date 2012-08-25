class Legacy
  def self.connection
    conn = ActiveRecord::Base.connection
    conn.schema_search_path = 'public, legacy_migrate'
    conn
  end
end