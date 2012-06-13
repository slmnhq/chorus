require 'csv'

class GpdbColumnStatistics
  def initialize(null_frac, n_distinct, most_common_vals, most_common_freqs, histogram_bounds, row_count)
    @raw_null_fraction = null_frac
    @raw_number_distinct = n_distinct
    @raw_most_common_vals = most_common_vals
    @raw_most_common_freqs = most_common_freqs
    @raw_histogram_bounds = histogram_bounds
    @raw_row_count = row_count
  end

  def null_fraction
    @raw_null_fraction.to_f unless @raw_null_fraction.blank?
  end

  def common_values
    return nil unless @raw_most_common_vals.present?
    CSV.parse(@raw_most_common_vals[1...-1]).first[0..4]
  end

  def number_distinct
    return nil unless @raw_number_distinct.present?

    if @raw_number_distinct.to_f < 0
      (@raw_number_distinct.to_f * -1 * @raw_row_count.to_i).round
    else
      @raw_number_distinct.to_i
    end
  end
end