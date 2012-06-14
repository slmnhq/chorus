class GpdbColumnPresenter < Presenter
  delegate :name, :data_type, :description, :to => :model

  def to_hash
    {
      :name => h(name),
      :data_type => h(data_type),
      :type_category => type_category,
      :description => h(description),
      :statistics => statistics
    }
  end
  
  def type_category
    case data_type
    when /\[\]/
      "OTHER"
    when /integer/, "bigint", "smallint"
      "WHOLE_NUMBER"
    when "real", /numeric/, /double/
      "REAL_NUMBER"
    when "boolean"
      "BOOLEAN"
    when /character/, /bit/, "interval"
      "STRING"
    when "text"
      "LONG_STRING"
    when /timestamp/
      "DATETIME"
    when /time/
      "TIME"
    when "date"
      "DATE"
    when "bytea"
      "BINARY"
    else
      "OTHER"
    end
  end

  def statistics
    return {} unless model.statistics.present?
    present(model.statistics)
  end
end