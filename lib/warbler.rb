require 'rubygems'
require 'warbler/time_period'
require 'sinatra'
require 'haml'
require 'sass'
require 'json'

set :public, File.join([File.dirname(__FILE__), "..",  "public"])
set :sass, {:style => :compact, :syntax => :scss } # default Sass style is :nested


get '/' do
  haml :index
end

get '/tick.json' do
  content_type :json
  {:result => Array.new(rand(100)).map{|x| rand(100).to_f/100}}.to_json
end

get '/stylesheet.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :stylesheet, :style => :expanded # overridden
end
