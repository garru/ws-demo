require 'rubygems'
require '../vendor/em-websocket/lib/em-websocket'
require 'json'
  # Runs the server at port 10081. It allows connections whose origin is example.com.

EventMachine.run {
  @channel = EM::Channel.new

  EventMachine::add_periodic_timer( 0.1 ) { @channel.push({:result => Array.new(rand(10)).map{|x| rand(100).to_f/100} }.to_json)}


  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080, :debug => true) do |ws|

    ws.onopen {
      sid = @channel.subscribe { |msg| ws.send msg }
       @channel.push "{'result':[]}"

      ws.onclose {
        @channel.unsubscribe(sid)
      }
    }
  end
  puts "Server started"

}
