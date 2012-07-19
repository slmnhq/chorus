class BoxplotSummary
  def self.mean(a,b)
    (a + b) / 2.0
  end

  def self.summarize(i)
    new_map = []

    all_categories = i.map{|r| r[:category]}.uniq
    total = i.inject(0) { |sum, r| sum + r[:count] }
    all_categories.each do |category|
      subarray = i.select{ |r| r[:category] == category }
      min = subarray.first[:min]
      max = subarray.last[:max]
      count = subarray.inject(0) { |sum, r| sum + r[:count] }
      percentage = "%0.2f\%" % (count.to_f / total * 100)

      if subarray.length == 1
        median = first_quartile = third_quartile = subarray[0][:min]
      elsif subarray.length == 2
        median         = mean(subarray[0][:min], subarray[1][:min])
        first_quartile = mean(subarray[0][:min], median)
        third_quartile = mean(subarray[1][:min], median)
      elsif subarray.length == 3
        median = subarray[1][:min]
        first_quartile = mean(subarray[0][:min], subarray[1][:min])
        third_quartile = mean(subarray[1][:min], subarray[2][:min])
      else
        median = mean(subarray[1][:max], subarray[2][:min])
        first_quartile = mean(subarray[0][:max], subarray[1][:min])
        third_quartile = mean(subarray[2][:max], subarray[3][:min])
      end

      new_map << {:category => category,
                  :min => min,
                  :median => median,
                  :max => max,
                  :first_quartile => first_quartile,
                  :third_quartile => third_quartile,
                  :count => count,
                  :percentage => percentage}
    end
    return new_map
  end
end
