class AsyncQueryTask < ActiveRecord::Base
  attr_accessible :process_id, :check_id
  validates_presence_of :process_id, :check_id
end