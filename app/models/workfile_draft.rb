class WorkfileDraft < ActiveRecord::Base
  has_attached_file :contents
  belongs_to :workfile
  belongs_to :owner, :class_name => 'User'
end

