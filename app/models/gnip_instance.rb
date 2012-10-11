class GnipInstance < ActiveRecord::Base
  attr_accessible :name, :stream_url, :description, :username, :password, :owner
  attr_accessor :highlighted_attributes, :search_result_notes

  validates_presence_of :name, :stream_url, :username, :password, :owner

  belongs_to :owner, :class_name => 'User'

  searchable do
    text :name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :description, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    string :grouping_id
    string :type_name
    string :security_type_name
  end
end