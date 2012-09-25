module SearchExtensions
  extend ActiveSupport::Concern

  included do
    class_attribute :shared_search_fields
  end

  module ClassMethods
    def type_name
      name
    end

    def has_shared_search_fields(field_definitions)
      self.shared_search_fields = field_definitions
      define_shared_search_fields(field_definitions)
    end

    def define_shared_search_fields(field_definitions, receiver_name=nil)
      searchable do |s|
        field_definitions.each do |field_def|
          method_name = (field_def[:options] && field_def[:options][:using]) || field_def[:name]
          delegate method_name, :to => receiver_name if receiver_name
          s.public_send(field_def[:type], field_def[:name], field_def[:options].try(:dup))
        end
      end
    end
  end

  def grouping_id
    "#{type_name} #{id}"
  end

  def type_name
    self.class.type_name
  end

  def entity_type_name
    self.class.name.underscore
  end
end

module ActiveRecord
  class Base
    include SearchExtensions
  end
end

module SunspotSearchExtensions
  extend ActiveSupport::Concern

  def execute
    results = super

    new_highlights = {}
    @solr_result['highlighting'].each do |key, value|
      key = key.sub(/^Gpdb(Table|View)|^ChorusView/, 'Dataset')
      new_highlights[key] = value
    end
    @solr_result['highlighting'] = new_highlights

    results
  end

  def associate_grouped_notes_with_primary_records
    docs = solr_response['docs'] = []
    group_response = group(:grouping_id)
    return unless group_response && group_response.groups
    notes_for_object = Hash.new() { |hsh, key| hsh[key] = [] }
    group_response.groups.each do |group|
      docs << {'id' => group.value}
      group.hits.each do |group_hit|
        if group_hit.class_name =~ /^Event/
          notes_for_object[group.value] << {:highlighted_attributes => group_hit.highlights_hash}
        end
      end
    end

    hits.each do |hit|
      hit.notes = notes_for_object[hit.id]
    end

    move_highlighted_attributes_to_results
  end

  def move_highlighted_attributes_to_results
    each_hit_with_result do |hit, result|
      result.highlighted_attributes = hit.highlights_hash
    end
  end
end

module Sunspot
  module Search
    class StandardSearch
      include SunspotSearchExtensions
    end

    class Hit
      attr_accessor :notes

      def id
        @stored_values['id']
      end

      def highlights_hash
        highlights.inject({}) do |hsh, highlight|
          hsh[highlight.field_name] ||= []
          hsh[highlight.field_name] << highlight.format
          hsh
        end
      end

      def result=(new_result)
        if (notes)
          new_result.search_result_notes = notes
        end
        @result = new_result
      end
    end
  end
end
