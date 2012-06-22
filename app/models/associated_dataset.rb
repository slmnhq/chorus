class AssociatedDataset < ActiveRecord::Base
  validates_uniqueness_of :dataset_id, :scope => :workspace_id
  validates_presence_of :workspace_id, :dataset_id

  belongs_to :workspace
  belongs_to :dataset
end
