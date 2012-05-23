class WorkfileVersion < ActiveRecord::Base
  attr_accessible :commit_message
  has_attached_file :contents
  belongs_to :workfile
  belongs_to :owner, :class_name => 'User'
  belongs_to :modifier, :class_name => 'User'

  def extension
    File.extname(contents.original_filename)[1..-1].try(:upcase)
  end

  def image?
    content_type && content_type.include?('image')
  end

  def text?
    content_type && content_type.include?('text')
  end

  def content_type
    contents.content_type
  end
end
