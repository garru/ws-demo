require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe "Warbler::TimePeriod" do
  
  before do
    @data = [0.1, 0.1, 0.1, 0.4]
    @low = 0
    @high = 0.2
    @num_buckets = 4
    @time_period = Warbler::TimePeriod.new(@data, @low, @high, @num_buckets)
  end
  
  describe ".initialize" do
    it "should create new time period" do
      @time_period.data.should == @data
      @time_period.low.should == @low
      @time_period.high.should == @high
      @time_period.num_buckets.should == @num_buckets
    end
  end
  
  describe "#buckets" do
    it "should return num_buckets with segmented ranges" do
      buckets = [0.05, 0.1, 0.15, 0.2]
      @time_period.buckets.each_with_index do |x, i|
        x.to_s.should == buckets[i].to_s
      end
    end
  end
  
  describe "#bucket" do
    it "should return the bucket for a given value" do
      @time_period.bucket(0.1).should == 0.1
      @time_period.bucket(0.4).should == nil
    end
  end

  describe "#results" do
    it "should return buckets" do
      @time_period.results.should == { 0.1 => 3 }
    end
  end
end