class Workfile < ActiveRecord::Base
  attr_accessible :description, :file_name

  belongs_to :workspace
  belongs_to :owner, :class_name => 'User'

  has_many :versions, :class_name => 'WorkfileVersion'
  has_many :drafts, :class_name => 'WorkfileDraft'

  validates_format_of :file_name, :with => /^[a-zA-Z0-9_ \.\(\)\-]+$/

  def self.by_type(file_type)
    scoped.find_all { |workfile| workfile.versions.last.file_type == file_type.downcase }
  end
  
  def create_new_version(user, source_file, message)
    versions.create!(
      :owner => user,
      :modifier => user,
      :contents => source_file,
      :version_num => last_version_number + 1,
      :commit_message => message,
    )
  end

  def last_version
    versions.order("version_num").last
  end

  private
  def last_version_number
    last_version.try(:version_num) || 0
  end
end
