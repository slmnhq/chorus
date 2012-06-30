class Membership < ActiveRecord::Base
  belongs_to :user
  belongs_to :workspace
  validates_presence_of :user
  validates_presence_of :workspace

  after_create :index_workspace
  after_destroy :index_workspace

  def index_workspace
    workspace.solr_index
  end
end
