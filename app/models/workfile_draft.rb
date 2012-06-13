class WorkfileDraft < ActiveRecord::Base
  attr_accessible :content

  belongs_to :owner, :class_name => User
  belongs_to :workfile
end
