class GpdbColumnPresenter < Presenter
  delegate :name, :data_type, :description, :to => :model

  def to_hash
    {
      :name => h(name),
      :type_category => type_category,
      :description => h(description)
    }
  end
  
  def type_category
    case data_type
    when /\[\]/, "time with time zone"
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
end