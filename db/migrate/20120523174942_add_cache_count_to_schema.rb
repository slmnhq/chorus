class AddCacheCountToSchema < ActiveRecord::Migration
  class GpdbDatabaseObject < ActiveRecord::Base
  end

  class GpdbSchema < ActiveRecord::Base
    has_many :database_objects, :class_name => 'GpdbDatabaseObject', :foreign_key => :schema_id
  end

  def self.up
    add_column :gpdb_schemas, :database_objects_count, :integer, :default => 0

    GpdbSchema.find_each do |schema|
      schema.update_attribute :database_objects_count, schema.database_objects.count
    end
  end

  def self.down
    remove_column :gpdb_schemas, :database_objects_count
  end
end
