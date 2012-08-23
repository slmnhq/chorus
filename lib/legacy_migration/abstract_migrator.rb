class AbstractMigrator
  def self.ensure_legacy_id(sym)
    unless ActiveRecord::Base.connection.column_exists?(sym, :legacy_id)
      ActiveRecord::Base.connection.add_column sym, :legacy_id, :string
    end
  end
end