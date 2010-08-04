module Warbler
  class TimePeriod
    attr_accessor :data, :low, :high, :num_buckets

    def initialize(data, low, high, num_buckets)
      @data = data
      @low = low
      @high = high
      @num_buckets = num_buckets
    end

    def buckets
      @buckets ||= begin
        step = (high - low)/num_buckets
        buckets = []
        step_range = low
        num_buckets.times do |x|
          buckets << step_range += step
        end
        buckets
      end
    end

    def bucket(value)
      buckets.reverse.find{ |y| value >= y && value <= high}
    end

    def results
      @results ||= begin
        @data.inject({}) do |h, v|
          bucket_v = bucket(v)
          if bucket_v
            h[bucket_v] ||= 0
            h[bucket(v)] += 1
          end
          h
        end
      end
    end

    def to_json
      {:low => low, :high => high, :buckets => buckets, :data => results}
    end
  end
end