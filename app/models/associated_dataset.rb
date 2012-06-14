class AssociatedDataset < ActiveRecord::Base
  validates_uniqueness_of :gpdb_database_object_id, :scope => :workspace_id
  validates_presence_of :workspace, :gpdb_database_object

  attr_accessible :gpdb_database_object_id, :workspace_id

  belongs_to :workspace
  belongs_to :gpdb_database_object
end
