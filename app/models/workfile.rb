class Workfile < ActiveRecord::Base
  attr_accessible :description, :file_name

  belongs_to :workspace
  belongs_to :owner, :class_name => 'User'

  has_many :versions, :class_name => 'WorkfileVersion'
  has_many :drafts, :class_name => 'WorkfileDraft'

  validates_format_of :file_name, :with => /^[a-zA-Z0-9_ \.\(\)\-]+$/
end
